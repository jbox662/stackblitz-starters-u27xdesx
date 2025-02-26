import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { MapPin, Loader, User, Clock, Filter, Search } from 'lucide-react';
import Card, { CardBody } from '../components/Card';
import Button from '../components/Button';
import FormSelect from '../components/FormSelect';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

// Default to San Francisco coordinates
const DEFAULT_CENTER: LatLngExpression = [37.7749, -122.4194];
const DEFAULT_ZOOM = 12;

interface Job {
  id: string;
  title: string;
  location: string;
  status: string;
  start_time: string;
  customer: {
    name: string;
    address: string;
  };
  assigned_user?: {
    name: string;
    role: string;
  };
  coordinates?: [number, number];
}

interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

// Component to handle map center and zoom updates
function MapUpdater({ center, zoom }: { center: LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const MapView = () => {
  const [center, setCenter] = useState<LatLngExpression>(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [jobsWithCoordinates, setJobsWithCoordinates] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs-with-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          location,
          status,
          start_time,
          customer:customers (
            name,
            address
          ),
          assigned_user:app_users (
            name,
            role
          )
        `)
        .in('status', ['scheduled', 'in_progress']);
      
      if (error) throw error;
      return data as Job[];
    }
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_users')
        .select('id, name, role')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Geocode addresses to coordinates with rate limiting
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }
      
      const data = await response.json() as GeocodingResult[];
      
      if (data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
      
      console.warn(`No coordinates found for address: ${address}`);
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Process jobs and geocode addresses
  useEffect(() => {
    const processJobs = async () => {
      if (!jobs || isGeocoding) return;
      
      setIsGeocoding(true);
      const processedJobs: Job[] = [];
      
      for (const job of jobs) {
        try {
          const address = job.location || job.customer.address;
          if (!address) {
            console.warn(`No address found for job: ${job.id}`);
            continue;
          }
          
          const coordinates = await geocodeAddress(address);
          if (coordinates) {
            processedJobs.push({ ...job, coordinates });
          }
        } catch (error) {
          console.error(`Error processing job ${job.id}:`, error);
        }
      }
      
      setJobsWithCoordinates(processedJobs);
      
      if (processedJobs.length > 0 && processedJobs[0].coordinates) {
        setCenter(processedJobs[0].coordinates);
        setZoom(12); // Set a reasonable initial zoom level
      }
      
      setIsGeocoding(false);
    };

    processJobs();
  }, [jobs]);

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    if (job.coordinates) {
      setCenter(job.coordinates);
      setZoom(16); // Zoom in closer when selecting a job
    }
  };

  // Filter jobs based on search query and filters
  const filteredJobs = jobsWithCoordinates.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    const matchesAssignee = 
      assigneeFilter === 'all' ||
      (assigneeFilter === 'unassigned' && !job.assigned_user) ||
      (job.assigned_user?.id === assigneeFilter);

    return matchesSearch && matchesStatus && matchesAssignee;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-[#1a1f2b] rounded-lg shadow">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Service Area Map</h1>
        <Button
          variant="secondary"
          icon={Filter}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          Filters
        </Button>
      </div>

      {isFilterOpen && (
        <Card className="mb-6">
          <CardBody className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Assigned To
                </label>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="unassigned">Unassigned</option>
                  {users?.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1a1f2b] rounded-lg shadow relative">
          <div className="h-[600px] relative rounded-lg overflow-hidden z-0">
            <MapContainer
              center={center}
              zoom={zoom}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater center={center} zoom={zoom} />
              {filteredJobs.map((job) => job.coordinates && (
                <Marker
                  key={job.id}
                  position={job.coordinates}
                  eventHandlers={{
                    click: () => handleJobSelect(job),
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.customer.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(job.start_time).toLocaleString()}
                      </p>
                      {job.assigned_user && (
                        <p className="text-sm text-gray-600">
                          Assigned to: {job.assigned_user.name}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card
              key={job.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedJob?.id === job.id ? 'ring-2 ring-blue-500 transform scale-[1.02]' : 'hover:bg-gray-800'
              }`}
              onClick={() => handleJobSelect(job)}
            >
              <CardBody className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {job.customer.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(job.start_time).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400 flex items-center mt-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location || job.customer.address}
                    </p>
                    {job.assigned_user && (
                      <p className="text-sm text-gray-400 flex items-center mt-1">
                        <User className="w-4 h-4 mr-1" />
                        Assigned to: {job.assigned_user.name}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {job.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
          {filteredJobs.length === 0 && !isGeocoding && (
            <div className="text-center text-gray-400 py-8">
              No jobs found in the selected area
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, User, LogOut, Phone, Mail } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useAuth } from '../contexts/AuthContext';
import { searchBusinesses, getUploadedFileUrl } from '../lib/api';
import type { Business } from '../lib/api';
import { toast } from 'sonner';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, logout } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async (filters?: { specialty?: string; location?: string }) => {
    try {
      setLoading(true);
      const response = await searchBusinesses(filters);
      setBusinesses(response.data);
    } catch (error) {
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadBusinesses({
      specialty: specialty === 'all' ? searchQuery : specialty || searchQuery,
      location: location,
    });
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Use reverse geocoding to get city name
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const state = data.address?.state || '';
            const locationString = city && state ? `${city}, ${state}` : city || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            
            setLocation(locationString);
            toast.success(`Location set to: ${locationString}`);
            
            // Automatically search with the new location
            loadBusinesses({
              specialty: specialty === 'all' ? searchQuery : specialty || searchQuery,
              location: locationString,
            });
          } catch (err) {
            toast.error('Failed to get location details');
          }
        },
        () => {
          toast.error('Failed to get your location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleBusinessClick = (businessId: number) => {
    navigate(`/business/${businessId}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              AppointMe
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 py-6 px-5 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="capitalize">{userType}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate(userType === 'customer' ? '/dashboard' : '/business/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  {userType === 'customer' && (
                    <DropdownMenuItem onClick={() => navigate('/appointments')}>
                      My Appointments
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="w-full px-8 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-6 text-gray-900">
              Book Your Next Appointment
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Find and book services with local businesses in seconds
            </p>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for services (e.g., Hair Salon, Dentist, Legal...)"
                  className="pl-12 h-14 text-lg border shadow-sm hover:shadow-md transition-shadow"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button size="lg" onClick={handleSearch} className="h-14 px-8 shadow-sm hover:shadow-md transition-shadow">
                Search
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="w-[200px] h-12 shadow-sm hover:shadow-md transition-shadow px-4 py-6">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="all" className="px-4 py-3 hover:bg-gray-100">All Categories</SelectItem>
                  <SelectItem value="Hair Salon" className="px-4 py-3 hover:bg-gray-100">Hair Salon</SelectItem>
                  <SelectItem value="Dental" className="px-4 py-3 hover:bg-gray-100">Dental</SelectItem>
                  <SelectItem value="Legal" className="px-4 py-3 hover:bg-gray-100">Legal</SelectItem>
                  <SelectItem value="Beauty" className="px-4 py-3 hover:bg-gray-100">Beauty</SelectItem>
                  <SelectItem value="Medical" className="px-4 py-3 hover:bg-gray-100">Medical</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Location (e.g., Dallas, TX)"
                  className="pl-12 h-12 shadow-sm hover:shadow-md transition-shadow"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <Button variant="outline" onClick={handleUseCurrentLocation} className="h-12 shadow-sm hover:shadow-md transition-shadow">
                <Navigation className="h-4 w-4 mr-2" />
                Use My Location
              </Button>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Businesses List */}
      <section className="w-full px-6 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-gray-900">
            {loading ? 'Loading...' : `${businesses.length} Businesses Available`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card
                key={business.id}
                className="pt-0 cursor-pointer hover:shadow-md transition-shadow border shadow-sm overflow-hidden"
                onClick={() => handleBusinessClick(business.id)}
              >
                {/* Business Image Backdrop */}
                <div className="relative h-50 bg-linear-to-br from-blue-100 to-purple-100 overflow-hidden">
                  {business.cover_image ? (
                    <img
                      src={getUploadedFileUrl(business.cover_image)}
                      alt={business.business_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl font-bold text-white/20">
                        {business.business_name.charAt(0)}
                      </div>
                    </div>
                  )}
                  {/* Placeholder for actual image */}
                  {business.specialty && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                        {business.specialty}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-gray-900">{business.business_name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center">
                        <MapPin className="h-3 w-3 mr-1 shrink-0" />
                        <span className="line-clamp-1">{business.address}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-5">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {business.description || 'Professional services'}
                  </p>
                  <div className="space-y-2 text-sm">
                    {business.phone && (
                      <div className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <Phone className="h-4 w-4 mr-2 text-blue-600 shrink-0" />
                        <span className="truncate">{business.phone}</span>
                      </div>
                    )}
                    {business.email && (
                      <div className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <Mail className="h-4 w-4 mr-2 text-blue-600 shrink-0" />
                        <span className="truncate">{business.email}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!loading && businesses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No businesses found. Try adjusting your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t mt-auto py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 text-center text-gray-600">
          <p className="font-medium">&copy; 2025 AppointMe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

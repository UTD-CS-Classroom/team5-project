import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft, UserCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerAppointments } from '../lib/api';
import type { Appointment } from '../lib/api';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getCustomerAppointments();
      setAppointments(response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const upcomingAppointments = appointments.filter(apt => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = apt.appointment_date.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day);
    const today = new Date();
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today && apt.status !== 'cancelled' && apt.status !== 'completed';
  });
  const pastAppointments = appointments.filter(apt => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = apt.appointment_date.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day);
    const today = new Date();
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return appointmentDate < today || apt.status === 'cancelled' || apt.status === 'completed';
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/profile')}>
              <UserCircle className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-600">Total Appointments</CardDescription>
              <CardTitle className="text-3xl font-semibold text-gray-900">{appointments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-600">Upcoming</CardDescription>
              <CardTitle className="text-3xl font-semibold text-blue-600">{upcomingAppointments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-600">Completed</CardDescription>
              <CardTitle className="text-3xl font-semibold text-green-600">
                {appointments.filter(a => a.status === 'completed').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            <Button onClick={() => navigate('/appointments')}>View All</Button>
          </div>
          
          {loading ? (
            <Card className="border shadow-sm">
              <CardContent className="py-12 text-center text-gray-500">
                Loading appointments...
              </CardContent>
            </Card>
          ) : upcomingAppointments.length === 0 ? (
            <Card className="border shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Button onClick={() => navigate('/')}>Find a Business</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <Card key={appointment.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            Appointment #{appointment.appointment_id}
                          </h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {(() => {
                              const [year, month, day] = appointment.appointment_date.split('-').map(Number);
                              return format(new Date(year, month - 1, day), 'MMM dd, yyyy');
                            })()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.appointment_time.substring(0, 5)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            Business ID: {appointment.business_id}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            <CardDescription>Manage your appointments and profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="w-full" onClick={() => navigate('/')}>
                Find Businesses
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/appointments')}>
                View All Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

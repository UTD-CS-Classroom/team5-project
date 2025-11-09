import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Save, Plus, Edit, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import api, { 
  uploadBusinessProfileImage, 
  uploadBusinessCoverImage, 
  deleteBusinessProfileImage, 
  deleteBusinessCoverImage,
  getUploadedFileUrl 
} from '../lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

interface TimeSlot {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BusinessProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [timeSlotDialogOpen, setTimeSlotDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    category: '',
  });

  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: 0,
    duration_minutes: 30,
    is_active: true,
  });

  const [timeSlotForm, setTimeSlotForm] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: 30,
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.business_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        description: user.description || '',
        category: user.specialty || '',
      });
      // Load images if available
      if (user.profile_image) {
        setProfileImage(user.profile_image);
      }
      if (user.cover_image) {
        setCoverImage(user.cover_image);
      }
    }
    fetchServices();
    fetchTimeSlots();
  }, [user]);

  const fetchServices = async () => {
    try {
      const response = await api.get('/business/services');
      setServices(response.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    }
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await api.get('/business/timeslots');
      setTimeSlots(response.data);
    } catch (error) {
      toast.error('Failed to fetch time slots');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/business/profile', profileData);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.delete('/business/account');
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete account');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }

    setUploadingImage(true);
    try {
      const response = await uploadBusinessProfileImage(file);
      setProfileImage(response.data.filename);
      toast.success('Profile image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (25MB)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }

    setUploadingImage(true);
    try {
      const response = await uploadBusinessCoverImage(file);
      setCoverImage(response.data.filename);
      toast.success('Cover image uploaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    try {
      await deleteBusinessProfileImage();
      setProfileImage(null);
      toast.success('Profile image deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete image');
    }
  };

  const handleDeleteCoverImage = async () => {
    try {
      await deleteBusinessCoverImage();
      setCoverImage(null);
      toast.success('Cover image deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete image');
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingService) {
        await api.put(`/business/services/${editingService.id}`, serviceForm);
        toast.success('Service updated successfully!');
      } else {
        await api.post('/business/services', serviceForm);
        toast.success('Service created successfully!');
      }
      setServiceDialogOpen(false);
      fetchServices();
      resetServiceForm();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    try {
      await api.delete(`/business/services/${id}`);
      toast.success('Service deleted successfully!');
      fetchServices();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete service');
    }
  };

  const handleSaveTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTimeSlot) {
        await api.put(`/business/timeslots/${editingTimeSlot.id}`, timeSlotForm);
        toast.success('Time slot updated successfully!');
      } else {
        await api.post('/business/timeslots', timeSlotForm);
        toast.success('Time slot created successfully!');
      }
      setTimeSlotDialogOpen(false);
      fetchTimeSlots();
      resetTimeSlotForm();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save time slot');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTimeSlot = async (id: number) => {
    try {
      await api.delete(`/business/timeslots/${id}`);
      toast.success('Time slot deleted successfully!');
      fetchTimeSlots();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete time slot');
    }
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      description: '',
      price: 0,
      duration_minutes: 30,
      is_active: true,
    });
    setEditingService(null);
  };

  const resetTimeSlotForm = () => {
    setTimeSlotForm({
      day_of_week: 1,
      start_time: '09:00',
      end_time: '17:00',
      slot_duration_minutes: 30,
      is_active: true,
    });
    setEditingTimeSlot(null);
  };

  const openEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration_minutes: service.duration_minutes,
      is_active: service.is_active,
    });
    setServiceDialogOpen(true);
  };

  const openEditTimeSlot = (timeSlot: TimeSlot) => {
    setEditingTimeSlot(timeSlot);
    setTimeSlotForm({
      day_of_week: timeSlot.day_of_week,
      start_time: timeSlot.start_time.substring(0, 5),
      end_time: timeSlot.end_time.substring(0, 5),
      slot_duration_minutes: timeSlot.slot_duration_minutes,
      is_active: timeSlot.is_active,
    });
    setTimeSlotDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/business/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="timeslots">Time Slots</TabsTrigger>
            <TabsTrigger value="danger">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <div className="space-y-6">
              {/* Images Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Images</CardTitle>
                  <CardDescription>Upload profile and cover images for your business (max 25MB)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Cover Image */}
                  <div className="space-y-3">
                    <Label>Cover Image</Label>
                    <div className="relative h-48 bg-linear-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                      {coverImage ? (
                        <>
                          <img
                            src={getUploadedFileUrl(coverImage)}
                            alt="Cover"
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleDeleteCoverImage}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">No cover image</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="cover-upload"
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleCoverImageUpload}
                        disabled={uploadingImage}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('cover-upload')?.click()}
                        disabled={uploadingImage}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? 'Uploading...' : 'Upload Cover Image'}
                      </Button>
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div className="space-y-3">
                    <Label>Profile Image</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 h-32 bg-linear-to-br from-blue-100 to-purple-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                        {profileImage ? (
                          <>
                            <img
                              src={getUploadedFileUrl(profileImage)}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1"
                              onClick={handleDeleteProfileImage}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Input
                          id="profile-upload"
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleProfileImageUpload}
                          disabled={uploadingImage}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('profile-upload')?.click()}
                          disabled={uploadingImage}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingImage ? 'Uploading...' : 'Upload Profile Image'}
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          Recommended: Square image, at least 200x200px
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Update your business details</CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Business Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={profileData.category}
                        onChange={(e) => setProfileData({ ...profileData, category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2"
                      value={profileData.description}
                      onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Services</CardTitle>
                    <CardDescription>Manage your business services</CardDescription>
                  </div>
                  <Button onClick={() => { resetServiceForm(); setServiceDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No services yet</p>
                  ) : (
                    services.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">${service.price}</span> • {service.duration_minutes} min
                            {!service.is_active && <span className="ml-2 text-red-600">(Inactive)</span>}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditService(service)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteService(service.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Slots Tab */}
          <TabsContent value="timeslots" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Time Slots</CardTitle>
                    <CardDescription>Manage your availability by day of the week</CardDescription>
                  </div>
                  <Button onClick={() => { resetTimeSlotForm(); setTimeSlotDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Slot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timeSlots.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No time slots yet. Add time slots to show your availability.</p>
                  ) : (
                    <>
                      {DAYS.map((dayName, dayIndex) => {
                        const daySlots = timeSlots.filter(slot => slot.day_of_week === dayIndex);
                        return (
                          <div key={dayIndex} className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-3 flex items-center justify-between">
                              <span>{dayName}</span>
                              {daySlots.length === 0 && (
                                <span className="text-sm text-gray-500 font-normal">Closed</span>
                              )}
                            </h3>
                            {daySlots.length > 0 ? (
                              <div className="space-y-2">
                                {daySlots.map((slot) => (
                                  <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                        {!slot.is_active && <span className="ml-2 text-red-600 text-xs">(Inactive)</span>}
                                      </p>
                                      <p className="text-xs text-gray-500">Slot duration: {slot.slot_duration_minutes} min</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline" onClick={() => openEditTimeSlot(slot)}>
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => handleDeleteTimeSlot(slot.id)}>
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="mt-6">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Permanently delete your business account</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete your account, there is no going back. All your appointments, services, and data will be permanently deleted.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Service Dialog */}
      <Dialog open={serviceDialogOpen} onOpenChange={(open) => { setServiceDialogOpen(open); if (!open) resetServiceForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
            <DialogDescription>
              {editingService ? 'Update service details' : 'Create a new service offering'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveService} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Service Name</Label>
              <Input
                id="service-name"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-description">Description</Label>
              <Input
                id="service-description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-price">Price ($)</Label>
                <Input
                  id="service-price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-duration">Duration (min)</Label>
                <Input
                  id="service-duration"
                  type="number"
                  min="1"
                  value={serviceForm.duration_minutes}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="service-active"
                checked={serviceForm.is_active}
                onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="service-active">Active</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save Service'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setServiceDialogOpen(false); resetServiceForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Time Slot Dialog */}
      <Dialog open={timeSlotDialogOpen} onOpenChange={(open) => { setTimeSlotDialogOpen(open); if (!open) resetTimeSlotForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTimeSlot ? 'Edit Time Slot' : 'Add Time Slot'}</DialogTitle>
            <DialogDescription>
              {editingTimeSlot ? 'Update time slot details' : 'Create a new availability slot'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTimeSlot} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="day">Day of Week</Label>
              <select
                id="day"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={timeSlotForm.day_of_week}
                onChange={(e) => setTimeSlotForm({ ...timeSlotForm, day_of_week: parseInt(e.target.value) })}
              >
                {DAYS.map((day, idx) => (
                  <option key={idx} value={idx}>{day}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={timeSlotForm.start_time}
                  onChange={(e) => setTimeSlotForm({ ...timeSlotForm, start_time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={timeSlotForm.end_time}
                  onChange={(e) => setTimeSlotForm({ ...timeSlotForm, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slot-duration">Slot Duration (minutes)</Label>
              <Input
                id="slot-duration"
                type="number"
                min="15"
                step="15"
                value={timeSlotForm.slot_duration_minutes}
                onChange={(e) => setTimeSlotForm({ ...timeSlotForm, slot_duration_minutes: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="slot-active"
                checked={timeSlotForm.is_active}
                onChange={(e) => setTimeSlotForm({ ...timeSlotForm, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="slot-active">Active</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save Time Slot'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setTimeSlotDialogOpen(false); resetTimeSlotForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your business account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

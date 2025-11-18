import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { customerRegister, businessRegister } from '../lib/api';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, loading: authLoading } = useAuth();
  const [userTypeForm, setUserTypeForm] = useState<'customer' | 'business'>('customer');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    business_name: '',
    phone: '',
    address: '',
    specialty: '',
    description: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // Redirect to appropriate dashboard based on user type
      navigate(userType === 'customer' ? '/dashboard' : '/business/dashboard', { replace: true });
    }
  }, [isAuthenticated, userType, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (userTypeForm === 'customer' && !formData.full_name) {
      toast.error('Please enter your full name');
      return;
    }

    if (userTypeForm === 'business' && !formData.business_name) {
      toast.error('Please enter your business name');
      return;
    }

    try {
      setLoading(true);

      if (userTypeForm === 'customer') {
        await customerRegister({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
        });
      } else {
        await businessRegister({
          email: formData.email,
          password: formData.password,
          business_name: formData.business_name,
          phone: formData.phone,
          address: formData.address,
          specialty: formData.specialty,
          description: formData.description,
        });
      }

      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">A</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              AppointmentsOnTheGo
            </h1>
          </div>
          <p className="text-gray-600">Create your account</p>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-900">Get Started</CardTitle>
            <CardDescription>Choose your account type and fill in your details</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  className={`py-2 px-4 rounded-md font-medium transition-all ${
                    userTypeForm === 'customer'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setUserTypeForm('customer')}
                >
                  Customer
                </button>
                <button
                  type="button"
                  className={`py-2 px-4 rounded-md font-medium transition-all ${
                    userTypeForm === 'business'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setUserTypeForm('business')}
                >
                  Business
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Customer Fields */}
                {userTypeForm === 'customer' && (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                        Full Name *
                      </label>
                      <Input
                        id="full_name"
                        name="full_name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}

                {/* Business Fields */}
                {userTypeForm === 'business' && (
                  <>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="business_name" className="text-sm font-medium text-gray-700">
                        Business Name *
                      </label>
                      <Input
                        id="business_name"
                        name="business_name"
                        type="text"
                        placeholder="Your Business Name"
                        value={formData.business_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="specialty" className="text-sm font-medium text-gray-700">
                        Specialty
                      </label>
                      <Input
                        id="specialty"
                        name="specialty"
                        type="text"
                        placeholder="e.g., Hair Salon, Dental"
                        value={formData.specialty}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="address" className="text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <Input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="123 Business St, City, State ZIP"
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Tell customers about your business..."
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full min-h-20 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Sign in
              </Link>
            </div>

            {/* Back to Home */}
            <div className="text-center mt-4">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 hover:underline">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

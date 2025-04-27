
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/store/userStore";
import { ArrowLeft } from "lucide-react";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useUserStore();
  
  const [profile, setProfile] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
  });
  
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // This would typically call an API to update the user's profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    });
  };
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.new !== password.confirm) {
      toast({
        title: "Passwords do not match",
        description: "New password and confirm password must match",
        variant: "destructive",
      });
      return;
    }
    
    // This would typically call an API to update the user's password
    toast({
      title: "Password Updated",
      description: "Your password has been updated successfully",
    });
    
    // Reset form
    setPassword({
      current: "",
      new: "",
      confirm: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/wallet/settings")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-fuel-green-700">Profile Settings</h2>
      </div>
      
      {/* Profile Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                className="bg-fuel-green-500 hover:bg-fuel-green-600"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="current" className="block text-sm font-medium">
                Current Password
              </label>
              <Input
                id="current"
                name="current"
                type="password"
                value={password.current}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new" className="block text-sm font-medium">
                New Password
              </label>
              <Input
                id="new"
                name="new"
                type="password"
                value={password.new}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirm" className="block text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                id="confirm"
                name="confirm"
                type="password"
                value={password.confirm}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                className="bg-fuel-green-500 hover:bg-fuel-green-600"
              >
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;

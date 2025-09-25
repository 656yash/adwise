import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { User, Mail, Phone, Shield, Settings } from 'lucide-react';

interface UserProfileProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function UserProfile({ isOpen, onToggle }: UserProfileProps) {
  const userData = {
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    role: "Marketing Manager",
    department: "Digital Marketing",
    joinDate: "Jan 2023"
  };

  return (
    <Popover open={isOpen} onOpenChange={onToggle}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userData.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {userData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{userData.name}</h3>
              <p className="text-sm text-muted-foreground">{userData.role}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userData.email}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userData.phone}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userData.department}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Joined {userData.joinDate}</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
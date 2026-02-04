import React, { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Edit3, User } from 'lucide-react';

interface ProfileHeaderProps {
  name: string;
  subtitle: string;
  avatarSrc?: string;
  onEditClick: () => void;
  onPhotoChange: (imageData: string) => void;
  variant?: 'profile' | 'student';
  programColor?: string;
}

const programColors: { [key: string]: string } = {
  'tahfizh-kamil': 'from-emerald-600 via-emerald-500 to-teal-400',
  'tahfizh-1': 'from-blue-600 via-blue-500 to-cyan-400',
  'tahfizh-2': 'from-purple-600 via-purple-500 to-pink-400',
  'tahsin': 'from-amber-600 via-amber-500 to-yellow-400',
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  subtitle,
  avatarSrc,
  onEditClick,
  onPhotoChange,
  variant = 'profile',
  programColor = 'tahfizh-kamil'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const bgClass = variant === 'profile' 
    ? 'bg-[#5db3d2]' 
    : `bg-gradient-to-r ${programColors[programColor] || programColors['tahfizh-kamil']}`;

  return (
    <div className={`relative ${bgClass} rounded-t-xl px-6 py-8`}>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Avatar with upload overlay */}
        <div className="relative group">
          <Avatar className="w-24 h-24 border-4 border-white/30 shadow-lg">
            <AvatarImage src={avatarSrc} alt={name} />
            <AvatarFallback className="bg-white/20 text-white text-2xl">
              <User size={40} />
            </AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="w-8 h-8 text-white" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Name and subtitle */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{name}</h2>
          <p className="text-white/80 text-sm sm:text-base">{subtitle}</p>
        </div>

        {/* Edit button */}
        <Button 
          onClick={onEditClick}
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white flex items-center gap-2"
        >
          <Edit3 size={16} />
          Edit Profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;
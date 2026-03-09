import { useState, useRef } from 'react';
import { Camera, Save, User, ShieldCheck, MessageCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { useAdBlocker } from '@/hooks/useAdBlocker';

export const ProfileSettings = () => {
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { enabled: adBlockerEnabled, toggle: toggleAdBlocker } = useAdBlocker();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Initialize form when profile loads
  useState(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setDiscordId((profile as any).discord_user_id || '');
    }
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); return; }
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }
    setUploading(true);
    await uploadAvatar(file);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const trimmedId = discordId.trim();
    const oldDiscordId = (profile as any)?.discord_user_id || '';
    const discordIdChanged = trimmedId && trimmedId !== oldDiscordId;

    await updateProfile({
      display_name: displayName,
      bio: bio,
      theme_preference: theme,
      discord_user_id: trimmedId || null,
    } as any);

    // Send Discord DM confirmation if ID was added/changed
    if (discordIdChanged) {
      try {
        const { error } = await supabase.functions.invoke('discord-send-dm', {
          body: { discord_user_id: trimmedId, display_name: displayName },
        });
        if (error) throw error;
        toast.success('Discord ID saved — check your DMs!');
      } catch {
        toast.info('Discord ID saved, but couldn\'t send a DM. Make sure you share a server with the Bloxwave bot.');
      }
    }

    setSaving(false);
  };

  const handleThemeChange = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme);
    updateProfile({ theme_preference: newTheme });
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-24 w-24 rounded-full bg-muted mx-auto" />
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Customize your profile information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-border">
              <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
              <AvatarFallback className="bg-primary/20 text-primary">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
            >
              <Camera className={`h-6 w-6 ${uploading ? 'animate-pulse' : ''}`} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
          <p className="text-sm text-muted-foreground">Click to upload a new avatar</p>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Enter your display name" maxLength={50} />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." maxLength={500} rows={4} />
          <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
        </div>

        {/* Discord Integration */}
        <div className="space-y-3 p-4 rounded-xl bg-[#5865F2]/5 border border-[#5865F2]/20">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-[#5865F2]" />
            <Label className="font-bold text-sm">Discord Notifications</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Link your Discord to get DM notifications when your favorited upcoming movies and shows are released.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="discordId" className="text-xs">Discord User ID</Label>
            <Input
              id="discordId"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
              placeholder="e.g. 123456789012345678"
              maxLength={20}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-secondary/30 rounded-lg p-2.5">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>
              To find your Discord User ID: Open Discord → Settings → Advanced → Enable Developer Mode → Right-click your username → Copy User ID
            </span>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Dark Mode</Label>
            <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
          </div>
          <Switch checked={theme === 'dark'} onCheckedChange={handleThemeChange} />
        </div>

        {/* Ad Blocker Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Ad Blocker
            </Label>
            <p className="text-sm text-muted-foreground">Blocks popups & redirects from video servers. Cannot block in-player ads.</p>
          </div>
          <Switch checked={adBlockerEnabled} onCheckedChange={toggleAdBlocker} />
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

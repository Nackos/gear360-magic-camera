import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Share2, MessageSquare, Heart, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'share' | 'like' | 'comment' | 'suggestion';
  message: string;
  timestamp: Date;
}

interface SocialSharingProps {
  isActive: boolean;
  settings: {
    smartNotifications: boolean;
  };
}

export const SocialSharing = ({ isActive, settings }: SocialSharingProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'suggestion',
      message: 'Moment idéal pour capturer le coucher de soleil',
      timestamp: new Date()
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const addNotification = (type: Notification['type'], message: string) => {
    if (!settings.smartNotifications) return;

    const newNotif: Notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotif, ...prev].slice(0, 5));
    toast.info(message);
  };

  const shareToSocial = (platform: string) => {
    addNotification('share', `Photo partagée sur ${platform}`);
    toast.success(`Partagé sur ${platform}`);
  };

  if (!isActive) return null;

  return (
    <div className="absolute top-20 right-4 space-y-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setShowNotifications(!showNotifications)}
        className="rounded-full bg-black/60 backdrop-blur-md border border-primary/30"
      >
        {settings.smartNotifications ? (
          <div className="relative">
            <Bell className="w-5 h-5 text-primary" />
            {notifications.length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-xs flex items-center justify-center text-white">
                {notifications.length}
              </div>
            )}
          </div>
        ) : (
          <BellOff className="w-5 h-5 text-muted-foreground" />
        )}
      </Button>

      {showNotifications && settings.smartNotifications && (
        <Card className="w-64 p-3 bg-black/80 backdrop-blur-md border-primary/30">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">Notifications</span>
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {notifications.length}
              </Badge>
            </div>

            {notifications.map((notif) => (
              <div key={notif.id} className="bg-card/10 rounded p-2">
                <div className="flex items-start gap-2">
                  {notif.type === 'share' && <Share2 className="w-4 h-4 text-blue-400 mt-0.5" />}
                  {notif.type === 'like' && <Heart className="w-4 h-4 text-red-400 mt-0.5" />}
                  {notif.type === 'comment' && <MessageSquare className="w-4 h-4 text-green-400 mt-0.5" />}
                  {notif.type === 'suggestion' && <Bell className="w-4 h-4 text-primary mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-xs text-white">{notif.message}</p>
                    <span className="text-xs text-muted-foreground">
                      {notif.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-border/20">
            <span className="text-xs text-muted-foreground mb-2 block">Partage rapide</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => shareToSocial('Instagram')}
                className="flex-1 h-8"
              >
                <Send className="w-3 h-3 mr-1" />
                Instagram
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => shareToSocial('Facebook')}
                className="flex-1 h-8"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Facebook
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

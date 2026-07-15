import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Instagram, Linkedin, Twitter, Facebook } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Step1PlatformsProps {
  selected: string[];
  onChange: (platforms: string[]) => void;
}

const PLATFORMS = [
  { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram, sizes: ['1080x1080', '1080x1350', '1080x1920'] },
  { id: 'LINKEDIN', name: 'LinkedIn', icon: Linkedin, sizes: ['1200x627', '1080x1080'] },
  { id: 'X', name: 'X (Twitter)', icon: Twitter, sizes: ['1200x675', '1080x1080'] },
  { id: 'FACEBOOK', name: 'Facebook', icon: Facebook, sizes: ['1200x630', '1080x1080'] },
];

export function Step1Platforms({ selected, onChange }: Step1PlatformsProps) {
  
  const togglePlatform = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(p => p !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-semibold">1. Select Target Platforms</h3>
        <p className="text-sm text-muted-foreground">Where would you like to publish this contentDraft?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => {
          const isSelected = selected.includes(platform.id);
          const Icon = platform.icon;
          
          return (
            <Card 
              key={platform.id} 
              className={`cursor-pointer transition-all border-2 ${isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:border-primary/20'}`}
              onClick={() => togglePlatform(platform.id)}
            >
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    checked={isSelected} 
                    onCheckedChange={() => togglePlatform(platform.id)} 
                  />
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium">{platform.name}</span>
                </div>
                
                {isSelected && (
                  <div className="pl-8 flex gap-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Image Size</label>
                      <Select defaultValue={platform.sizes[0]}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {platform.sizes.map(size => (
                            <SelectItem key={size} value={size}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

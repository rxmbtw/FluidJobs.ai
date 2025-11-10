import React from 'react';
import GlassCard from './GlassCard';
import { TelegramIcon, DiscordIcon, XIcon } from './Icons';

const communityLinks = [
  {
    name: 'Telegram',
    icon: <TelegramIcon />,
    glowColor: 'rgba(0, 136, 204, 0.5)',
  },
  {
    name: 'X',
    icon: <XIcon />,
    glowColor: 'rgba(200, 200, 200, 0.4)',
  },
  {
    name: 'Discord',
    icon: <DiscordIcon />,
    glowColor: 'rgba(88, 101, 242, 0.5)',
  }
];

const CommunitySection: React.FC = () => {
  return (
    <section className="w-full py-32 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12">
          {/* Card 1 */}
          <div className="w-full md:w-1/3 flex justify-center">
            <GlassCard 
              name={communityLinks[0].name} 
              icon={communityLinks[0].icon} 
              glowColor={communityLinks[0].glowColor}
            />
          </div>
          {/* Card 2 (Staggered) */}
          <div className="w-full md:w-1/3 flex justify-center md:mt-24">
            <GlassCard 
              name={communityLinks[1].name} 
              icon={communityLinks[1].icon} 
              glowColor={communityLinks[1].glowColor} 
            />
          </div>
          {/* Card 3 */}
          <div className="w-full md:w-1/3 flex justify-center">
            <GlassCard 
              name={communityLinks[2].name} 
              icon={communityLinks[2].icon} 
              glowColor={communityLinks[2].glowColor}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;

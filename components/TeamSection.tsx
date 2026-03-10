'use client';

import Image from 'next/image';

interface Milestone {
  year: string;
  text: string;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
  milestones: Milestone[];
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-col items-center text-center bg-white rounded-2xl shadow-sm border border-[#e8e4df] overflow-hidden hover:shadow-md transition-shadow">
      {/* Image container - fixed aspect ratio */}
      <div className="w-full aspect-[3/4] relative bg-[#f5f0eb] overflow-hidden">
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 w-full">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {member.name}
        </h3>
        <p className="text-[#6b7f3e] font-semibold text-sm md:text-base mb-5">
          {member.role}
        </p>

        {/* Milestones */}
        <div className="space-y-3 text-left">
          {member.milestones.map((milestone, index) => (
            <div key={index} className="flex gap-3 items-start">
              <span className="shrink-0 text-xs font-bold text-white bg-[#6b7f3e] rounded-full px-2.5 py-1 mt-0.5 min-w-[52px] text-center">
                {milestone.year}
              </span>
              <span className="text-sm text-gray-600 leading-relaxed">
                {milestone.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TeamSectionProps {
  title?: string;
  description?: string;
  members: TeamMember[];
}

export function TeamSection({ title, description, members }: TeamSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-[#f5f0eb]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        {(title || description) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Team Grid - centered */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {members.map((member, index) => (
            <TeamCard key={index} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}

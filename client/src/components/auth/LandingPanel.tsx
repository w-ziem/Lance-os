import { Folder, CheckSquare, Calendar } from 'lucide-react';
import type { ReactNode } from 'react';

// LandingPanel — left, dark, marketing column of AuthPage.
// Pure presentation: no props, no state. Hidden on screens < lg (auth-only on mobile).

export default function LandingPanel() {
  return (
    <aside
      className="hidden lg:flex flex-col justify-between bg-color-landing-bg text-white p-12 relative overflow-hidden"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    >
      <BrandBlock />
      <Catchphrase />
      <FeatureList />
      <SocialProof />
    </aside>
  );
}

function BrandBlock() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="font-header text-5xl font-extrabold leading-none">Lance</h1>
      <p className="font-header text-xs tracking-[0.25em] text-gray-400">FREELANCE OS</p>
      <span className="mt-1 inline-flex items-center gap-2 rounded-full bg-color-brand/15 px-3 py-1 text-xs text-gray-200 ring-1 ring-color-brand/30">
        <span className="h-1.5 w-1.5 rounded-full bg-color-brand" />
        AI agent included
      </span>
    </div>
  );
}

function Catchphrase() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-header text-6xl font-extrabold leading-[1.05] tracking-tight xl:text-7xl">
        <span className="block text-white">Run your freelance</span>
        <span className="block text-color-brand">business on autopilot.</span>
      </h2>
      <p className="max-w-md text-sm text-gray-400 leading-relaxed">
        Clients, projects, tasks, invoices — managed by you and your AI agent working in tandem.
      </p>
    </div>
  );
}

interface Feature {
  icon: ReactNode;
  title: string;
  desc?: string;
  active?: boolean;
}

function FeatureList() {
  const features: Feature[] = [
    {
      icon: <Folder size={18} className="text-white" />,
      title: 'Projects & clients',
      desc: 'Everything in one place — proposals, timelines, invoices, contacts.',
      active: true,
    },
    {
      icon: <CheckSquare size={18} className="text-gray-400" />,
      title: 'Task automation',
    },
    {
      icon: <Calendar size={18} className="text-gray-400" />,
      title: 'Smart scheduling',
    },
  ];

  return (
    <ul className="flex flex-col gap-3">
      {features.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </ul>
  );
}

function FeatureCard({ icon, title, desc, active }: Feature) {
  return (
    <li
      className={
        active
          ? 'flex items-start gap-3 rounded-xl border border-color-landing-border bg-color-landing-bg-soft px-4 py-3'
          : 'flex items-center gap-3 rounded-xl px-4 py-2'
      }
    >
      <span
        className={
          active
            ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-color-brand'
            : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5'
        }
      >
        {icon}
      </span>
      <div className="flex flex-col">
        <span className={active ? 'text-sm font-semibold text-white' : 'text-sm font-medium text-gray-300'}>
          {title}
        </span>
        {desc && <span className="text-xs text-gray-400 leading-relaxed">{desc}</span>}
      </div>
    </li>
  );
}

function SocialProof() {
  const avatars = [
    { initials: 'AK', bg: 'bg-rose-500' },
    { initials: 'JL', bg: 'bg-amber-500' },
    { initials: 'MR', bg: 'bg-emerald-500' },
    { initials: 'T+', bg: 'bg-color-brand' },
  ];
  return (
    <div className="flex items-center gap-3">
      <div className="flex">
        {avatars.map((a, i) => (
          <span
            key={a.initials}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-color-landing-bg ${a.bg} ${i === 0 ? '' : '-ml-2'}`}
          >
            {a.initials}
          </span>
        ))}
      </div>
      <p className="text-sm text-gray-400">
        Trusted by <span className="font-semibold text-white">2,400+</span> freelancers
      </p>
    </div>
  );
}

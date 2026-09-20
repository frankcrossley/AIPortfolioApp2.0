import React from 'react';
import { LifecycleStage, EstateItemType, ItemStatus, ValueHypothesisStatus, ConfidenceLevel } from '../types';

interface StatusBadgeProps {
  status: LifecycleStage | ItemStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  let dotColor = 'bg-slate-400';
  let textColor = 'text-slate-700';
  let bgColor = 'bg-slate-50';
  let borderColor = 'border-slate-200';

  switch (status) {
    case 'Production':
    case 'Active':
      dotColor = 'bg-emerald-500';
      textColor = 'text-emerald-700';
      bgColor = 'bg-emerald-50';
      borderColor = 'border-emerald-200/80';
      break;
    case 'Development':
    case 'In progress':
      dotColor = 'bg-blue-500';
      textColor = 'text-blue-700';
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-200/80';
      break;
    case 'Pilot':
    case 'Planning':
      dotColor = 'bg-amber-500';
      textColor = 'text-amber-700';
      bgColor = 'bg-amber-50';
      borderColor = 'border-amber-200/80';
      break;
    case 'Evaluation':
    case 'Under Review':
      dotColor = 'bg-purple-500';
      textColor = 'text-purple-700';
      bgColor = 'bg-purple-50';
      borderColor = 'border-purple-200/80';
      break;
    case 'Ideation':
      dotColor = 'bg-indigo-400';
      textColor = 'text-indigo-700';
      bgColor = 'bg-indigo-50';
      borderColor = 'border-indigo-200/80';
      break;
    case 'Retired':
    case 'On hold':
      dotColor = 'bg-slate-400';
      textColor = 'text-slate-600';
      bgColor = 'bg-slate-100';
      borderColor = 'border-slate-200';
      break;
  }

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${bgColor} ${textColor} ${borderColor} ${
        isSmall ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
};

interface TypeBadgeProps {
  type: EstateItemType;
  size?: 'sm' | 'md';
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, size = 'sm' }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (type) {
    case 'Platform':
      style = 'bg-blue-50 text-blue-700 border-blue-200/70';
      break;
    case 'Agent':
      style = 'bg-indigo-50 text-indigo-700 border-indigo-200/70';
      break;
    case 'Application':
      style = 'bg-sky-50 text-sky-700 border-sky-200/70';
      break;
    case 'Embedded AI':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200/70';
      break;
    case 'Initiative':
      style = 'bg-purple-50 text-purple-700 border-purple-200/70';
      break;
    case 'Experiment':
      style = 'bg-amber-50 text-amber-700 border-amber-200/70';
      break;
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${style} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {type}
    </span>
  );
};

interface ValueStatusBadgeProps {
  status: ValueHypothesisStatus;
  size?: 'sm' | 'md';
}

export const ValueStatusBadge: React.FC<ValueStatusBadgeProps> = ({ status, size = 'sm' }) => {
  let style = 'bg-slate-50 text-slate-500 border-slate-200';

  switch (status) {
    case 'Not defined':
      style = 'bg-slate-50 text-slate-500 border-slate-200';
      break;
    case 'Hypothesis':
      style = 'bg-amber-50 text-amber-700 border-amber-200/80';
      break;
    case 'Calculated':
      style = 'bg-blue-50 text-blue-700 border-blue-200/80';
      break;
    case 'Being measured':
      style = 'bg-purple-50 text-purple-700 border-purple-200/80';
      break;
    case 'Validated':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      break;
    case 'Realised':
      style = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      break;
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${style} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {status}
    </span>
  );
};

interface ConfidenceBadgeProps {
  level?: ConfidenceLevel;
  size?: 'sm' | 'md';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level, size = 'sm' }) => {
  if (!level) {
    return <span className="text-[11px] text-slate-400">Not set</span>;
  }

  let style = 'bg-slate-50 text-slate-600 border-slate-200';
  if (level === 'High') style = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  else if (level === 'Medium') style = 'bg-amber-50 text-amber-700 border-amber-200/80';
  else if (level === 'Low') style = 'bg-rose-50 text-rose-700 border-rose-200/80';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${style} ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {level}
    </span>
  );
};

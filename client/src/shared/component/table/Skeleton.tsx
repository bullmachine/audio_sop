import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  rounded?: boolean | string;
  variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = 16,
  rounded = true,
  variant = 'rect',
}) => {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius:
      typeof rounded === 'string'
        ? undefined
        : variant === 'circle'
        ? '9999px'
        : rounded
        ? '0.375rem'
        : 0,
  };

  const classes = [
    'animate-pulse bg-gray-200 dark:bg-gray-700',
    typeof rounded === 'string' ? rounded : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes} style={style} />;
};

export default Skeleton;

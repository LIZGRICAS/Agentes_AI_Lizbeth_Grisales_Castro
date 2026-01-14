"use client";

import React from 'react';
import { useRouter, useParams as nextUseParams } from 'next/navigation';

export function useParams<T = any>(): T {
  try {
    // next/navigation's useParams works in client components
    // cast to the requested generic type for compatibility
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return nextUseParams() as unknown as T;
  } catch {
    return {} as T;
  }
}

export function useNavigate() {
  const router = useRouter();
  return (to: string) => router.push(to);
}

export const Link: React.FC<any> = ({ children, to, href, className, ...props }) => {
  const resolvedHref = href ?? to ?? '/';
  return (
    <a href={resolvedHref} className={className} {...props}>
      {children}
    </a>
  );
};

export const Outlet: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;

export default {
  useParams,
  useNavigate,
  Link,
  Outlet,
};

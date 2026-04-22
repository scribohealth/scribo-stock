import { Link, type LinkProps } from '@tanstack/react-router'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface NavLinkCompatProps extends Omit<LinkProps, 'className' | 'activeProps' | 'pendingProps'> {
  className?: string
  activeClassName?: string
  pendingClassName?: string
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={className}
        activeProps={activeClassName ? { className: cn(className, activeClassName) } : undefined}
        pendingProps={pendingClassName ? { className: cn(className, pendingClassName) } : undefined}
        {...props}
      />
    )
  },
)

NavLink.displayName = 'NavLink'

export { NavLink }

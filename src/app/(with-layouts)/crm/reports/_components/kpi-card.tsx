import { Card, CardContent, CardFooter, CardHeader } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className={cn("flex size-8 items-center justify-center rounded-lg", iconClass)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="mt-6 p-0">
        <div className="mb-1.25 text-xl leading-7 font-semibold text-text-primary md:text-2xl md:leading-8">
          {value}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-0.5 p-0">
        <span className="text-sm leading-5 font-medium text-text-tertiary">{title}</span>
        {subtitle && <span className="text-xs leading-4 text-text-tertiary">{subtitle}</span>}
      </CardFooter>
    </Card>
  );
}

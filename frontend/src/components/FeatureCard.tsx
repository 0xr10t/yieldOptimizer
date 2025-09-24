import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => {
  return (
    <Card 
      className="bg-card/50 backdrop-blur-sm border-border hover:border-primary hover:shadow-card transition-all duration-500 group animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-6">
        <div className="mb-4 p-3 rounded-xl bg-gradient-primary w-fit group-hover:shadow-glow transition-all duration-300">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
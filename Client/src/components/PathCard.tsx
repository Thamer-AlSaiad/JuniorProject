import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, Database, ChartNetwork, BrainCog, ChartBar, ChartLine, BookOpen, Clock } from "lucide-react";
import { Path } from "../pages/services/pathService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

interface PathCardProps {
  path: Path;
  delay?: number;
}

const PathCard: React.FC<PathCardProps> = ({ path, delay = 0 }) => {
  const PathIcon = () => {
    const title = path.title.toLowerCase();
    
    if (title.includes('python') || title.includes('data')) {
      return <Database className="h-7 w-7" />;
    }
    
    if (title.includes('cluster') || title.includes('network')) {
      return <ChartNetwork className="h-7 w-7" />;
    }
    
    if (title.includes('machine') || title.includes('ai') || title.includes('intelligence')) {
      return <BrainCog className="h-7 w-7" />;
    }
    
    if (title.includes('visual') || title.includes('chart')) {
      return <ChartLine className="h-7 w-7" />;
    }
    
    return <BookOpen className="h-7 w-7" />;
  };

  const getTopics = () => {
    return [
      { icon: <BrainCog className="h-5 w-5 text-[#593797]" />, label: "Core Concepts" },
      { icon: <ChartBar className="h-5 w-5 text-[#593797]" />, label: "Practical Skills" },
      { icon: <Database className="h-5 w-5 text-[#593797]" />, label: "Projects" },
      { icon: <ChartLine className="h-5 w-5 text-[#593797]" />, label: "Advanced Topics" },
    ];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="overflow-hidden border-2 hover:border-[#593797] transition-all duration-300 h-full flex flex-col">
        <div className="relative h-80 overflow-hidden">
          <img 
            src={path.imageUrl} 
            alt={path.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
            }}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#00000050] to-transparent"></div>
        </div>
        
        <CardHeader className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#593797] rounded-full flex items-center justify-center text-white">
              <PathIcon />
            </div>
            <CardTitle className="text-2xl font-bold">{path.title}</CardTitle>
          </div>
          <CardDescription className="mt-4">{path.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              <span>{path.estimatedHours || 0} hours</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {getTopics().map((topic, index) => (
              <div key={index} className="flex items-center space-x-2">
                {topic.icon}
                <span className="text-sm text-[#4a4358]">{topic.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="pt-2 pb-6">
          <Button asChild className="w-full bg-[#593797] hover:bg-[#432970] text-white">
            <Link to={`/paths/${path.slug}`}>
              Explore Path
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PathCard; 
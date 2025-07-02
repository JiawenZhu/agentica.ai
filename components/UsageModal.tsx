import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { 
  DollarSign, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  Zap,
  Calendar,
  BarChart3
} from 'lucide-react';

interface UsageData {
  totalCalls: number;
  totalMinutes: number;
  todayCalls: number;
  todayMinutes: number;
  avgCallDuration: number;
  costPerMinute: number;
  totalCost: number;
  todayCost: number;
  monthlyLimit: number;
  monthlyUsed: number;
}

interface UsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  agentId: number;
}

// Mock function to simulate real-time usage data
function generateUsageData(): UsageData {
  return {
    totalCalls: Math.floor(Math.random() * 500) + 100,
    totalMinutes: Math.floor(Math.random() * 1200) + 300,
    todayCalls: Math.floor(Math.random() * 20) + 5,
    todayMinutes: Math.floor(Math.random() * 60) + 15,
    avgCallDuration: Math.floor(Math.random() * 5) + 2,
    costPerMinute: 0.12,
    totalCost: 0,
    todayCost: 0,
    monthlyLimit: 1000,
    monthlyUsed: Math.floor(Math.random() * 800) + 200
  };
}

export function UsageModal({ isOpen, onClose, agentName, agentId }: UsageModalProps) {
  const [usageData, setUsageData] = useState<UsageData>(() => {
    const data = generateUsageData();
    data.totalCost = data.totalMinutes * data.costPerMinute;
    data.todayCost = data.todayMinutes * data.costPerMinute;
    return data;
  });
  const [isLive, setIsLive] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setUsageData(prev => {
        const newData = { ...prev };
        
        // Randomly update today's stats
        if (Math.random() > 0.7) {
          newData.todayCalls += 1;
          newData.todayMinutes += Math.floor(Math.random() * 3) + 1;
          newData.todayCost = newData.todayMinutes * newData.costPerMinute;
          newData.totalCalls += 1;
          newData.totalMinutes += Math.floor(Math.random() * 3) + 1;
          newData.totalCost = newData.totalMinutes * newData.costPerMinute;
          newData.monthlyUsed = Math.min(newData.monthlyUsed + 1, newData.monthlyLimit);
        }
        
        return newData;
      });
      setIsLive(true);
      setTimeout(() => setIsLive(false), 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const usagePercentage = (usageData.monthlyUsed / usageData.monthlyLimit) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Usage & Cost Analytics
            {isLive && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-1 animate-pulse" />
                Live
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Real-time usage statistics and cost breakdown for {agentName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Real-time metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Today's Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{usageData.todayCalls}</div>
                <p className="text-xs text-muted-foreground">
                  {usageData.todayMinutes} minutes total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Today's Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${usageData.todayCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  ${usageData.costPerMinute}/minute
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Total stats */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              All-time Statistics
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{usageData.totalCalls}</div>
                <p className="text-xs text-muted-foreground">Total Calls</p>
              </div>
              <div>
                <div className="text-lg font-semibold">{usageData.totalMinutes}m</div>
                <p className="text-xs text-muted-foreground">Total Minutes</p>
              </div>
              <div>
                <div className="text-lg font-semibold">${usageData.totalCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Total Cost</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Monthly usage */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Monthly Usage Limit
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Minutes Used</span>
                <span>{usageData.monthlyUsed} / {usageData.monthlyLimit}</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{usagePercentage.toFixed(1)}% used</span>
                <span>{usageData.monthlyLimit - usageData.monthlyUsed} remaining</span>
              </div>
            </div>
          </div>

          {/* Performance metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Avg Call Duration</span>
              </div>
              <div className="text-lg font-semibold">{usageData.avgCallDuration}m</div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Cost Efficiency</span>
              </div>
              <div className="text-lg font-semibold text-green-600">
                ${(usageData.totalCost / usageData.totalCalls).toFixed(2)}/call
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Detailed Analytics
            </Button>
            <Button variant="outline" className="flex-1">
              Export Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
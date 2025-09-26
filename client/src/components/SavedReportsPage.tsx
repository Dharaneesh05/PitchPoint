import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SavedReport {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  type: 'player_analysis' | 'team_analysis' | 'match_analysis' | 'performance_report';
  status: 'draft' | 'final' | 'shared';
  tags: string[];
  playerName?: string;
}

export function SavedReportsPage() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Mock reports data
      const mockReports: SavedReport[] = [
        {
          id: "1",
          title: "Virat Kohli Performance Analysis",
          description: "Comprehensive analysis of Virat Kohli's performance in Test cricket over the last 2 years",
          createdAt: "2024-12-15",
          updatedAt: "2024-12-15",
          type: "player_analysis",
          status: "final",
          tags: ["batting", "test_cricket", "india"],
          playerName: "Virat Kohli"
        },
        {
          id: "2",
          title: "India vs Australia Series Report",
          description: "Detailed match analysis and player performance review for the recent series",
          createdAt: "2024-12-14",
          updatedAt: "2024-12-14",
          type: "match_analysis",
          status: "shared",
          tags: ["series", "india", "australia"]
        },
        {
          id: "3",
          title: "Rohit Sharma Leadership Analysis",
          description: "Analysis of Rohit Sharma's captaincy and batting performance",
          createdAt: "2024-12-13",
          updatedAt: "2024-12-13",
          type: "player_analysis",
          status: "draft",
          tags: ["captaincy", "batting", "leadership"],
          playerName: "Rohit Sharma"
        },
        {
          id: "4",
          title: "Team India Bowling Strategy",
          description: "Strategic analysis of India's bowling approach in different conditions",
          createdAt: "2024-12-12",
          updatedAt: "2024-12-12",
          type: "team_analysis",
          status: "final",
          tags: ["bowling", "strategy", "team_analysis"]
        },
        {
          id: "5",
          title: "Jasprit Bumrah Injury Recovery",
          description: "Performance analysis post-injury recovery and current form",
          createdAt: "2024-12-11",
          updatedAt: "2024-12-11",
          type: "player_analysis",
          status: "draft",
          tags: ["injury", "recovery", "bowling"],
          playerName: "Jasprit Bumrah"
        }
      ];
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load saved reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(report => report.id !== id));
    toast({
      title: "Report Deleted",
      description: "The report has been successfully deleted.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'final': return 'bg-green-100 text-green-800';
      case 'shared': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'player_analysis': return 'Player Analysis';
      case 'team_analysis': return 'Team Analysis';
      case 'match_analysis': return 'Match Analysis';
      case 'performance_report': return 'Performance Report';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Saved Reports</h2>
          <p className="text-muted-foreground">Loading your saved reports...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Saved Reports</h2>
          <p className="text-muted-foreground">
            Your collection of cricket analysis reports
          </p>
        </div>
        <Button>
          Create New Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="player_analysis">Player Analysis</SelectItem>
                <SelectItem value="team_analysis">Team Analysis</SelectItem>
                <SelectItem value="match_analysis">Match Analysis</SelectItem>
                <SelectItem value="performance_report">Performance Report</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="final">Final</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-4xl mb-4"></div>
              <div>
                <h3 className="text-lg font-semibold">No Reports Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== "all" || filterStatus !== "all" 
                    ? "No reports match your current filters"
                    : "Start creating analysis reports from the Player Analysis page"
                  }
                </p>
              </div>
              <Button>
                Create Your First Report
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{report.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {getTypeDisplay(report.type)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {report.description}
                </p>
                
                {report.playerName && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Player:</span>
                    <Badge variant="outline">{report.playerName}</Badge>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1">
                  {report.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {report.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{report.tags.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Created: {new Date(report.createdAt).toLocaleDateString()}</div>
                  <div>Updated: {new Date(report.updatedAt).toLocaleDateString()}</div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteReport(report.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reports Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
                <div className="text-sm text-muted-foreground">Total Reports</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'draft').length}
                </div>
                <div className="text-sm text-muted-foreground">Drafts</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'final').length}
                </div>
                <div className="text-sm text-muted-foreground">Final</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {reports.filter(r => r.status === 'shared').length}
                </div>
                <div className="text-sm text-muted-foreground">Shared</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
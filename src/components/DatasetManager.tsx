import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Database, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Trash2,
  Eye,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DrugInteractionData {
  drug1: string;
  drug2: string;
  severity: 'severe' | 'moderate' | 'mild' | 'safe';
  description: string;
  recommendation: string;
  mechanism?: string;
  evidence_level?: string;
}

interface Dataset {
  id: string;
  name: string;
  uploadDate: string;
  rowCount: number;
  fileSize: string;
  status: 'active' | 'processing' | 'error';
  data: DrugInteractionData[];
}

interface DatasetManagerProps {
  onDatasetChange: (dataset: DrugInteractionData[] | null) => void;
}

export default function DatasetManager({ onDatasetChange }: DatasetManagerProps) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState<DrugInteractionData[] | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const text = await file.text();
      let parsedData: DrugInteractionData[] = [];

      if (file.name.endsWith('.json')) {
        parsedData = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parser
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        parsedData = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          
          return {
            drug1: obj.drug1 || obj['drug 1'] || obj.drugname1 || '',
            drug2: obj.drug2 || obj['drug 2'] || obj.drugname2 || '',
            severity: (obj.severity || 'mild').toLowerCase() as any,
            description: obj.description || obj.interaction || '',
            recommendation: obj.recommendation || obj.advice || '',
            mechanism: obj.mechanism || '',
            evidence_level: obj.evidence_level || obj['evidence level'] || ''
          };
        });
      }

      // Validate data structure
      const validData = parsedData.filter(item => 
        item.drug1 && item.drug2 && item.severity && item.description
      );

      if (validData.length === 0) {
        throw new Error('No valid drug interaction data found in file');
      }

      const newDataset: Dataset = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        uploadDate: new Date().toISOString().split('T')[0],
        rowCount: validData.length,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        status: 'active',
        data: validData
      };

      setDatasets(prev => [...prev, newDataset]);
      
      toast({
        title: "Dataset uploaded successfully",
        description: `${validData.length} drug interactions loaded from ${file.name}`,
      });

    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse dataset",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [toast]);

  const activateDataset = (datasetId: string) => {
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset) {
      setActiveDataset(datasetId);
      onDatasetChange(dataset.data);
      toast({
        title: "Dataset activated",
        description: `Now using ${dataset.name} for drug interaction analysis`,
      });
    }
  };

  const deactivateDataset = () => {
    setActiveDataset(null);
    onDatasetChange(null);
    toast({
      title: "Dataset deactivated",
      description: "Switched back to default drug interaction data",
    });
  };

  const deleteDataset = (datasetId: string) => {
    setDatasets(prev => prev.filter(d => d.id !== datasetId));
    if (activeDataset === datasetId) {
      deactivateDataset();
    }
    toast({
      title: "Dataset deleted",
      description: "Dataset has been removed from the system",
    });
  };

  const previewDataset = (dataset: Dataset) => {
    setPreviewData(dataset.data.slice(0, 10)); // Show first 10 rows
  };

  const exportDataset = (dataset: Dataset) => {
    const dataStr = JSON.stringify(dataset.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataset.name}_export.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Dataset Management
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Upload Drug Interaction Dataset</h3>
                <p className="text-sm text-muted-foreground">
                  Support for CSV and JSON files. Required fields: drug1, drug2, severity, description
                </p>
              </div>
              
              <div className="mt-6">
                <Label htmlFor="dataset-upload" className="cursor-pointer">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Processing...' : 'Choose File'}
                  </div>
                </Label>
                <input
                  id="dataset-upload"
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
            </div>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Expected format:</strong> CSV or JSON with columns: drug1, drug2, severity (severe/moderate/mild/safe), description, recommendation (optional)
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-4">
            {datasets.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No datasets uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {datasets.map((dataset) => (
                  <div key={dataset.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{dataset.name}</h4>
                        {activeDataset === dataset.id && (
                          <Badge className="bg-success text-success-foreground">Active</Badge>
                        )}
                        <Badge variant="secondary">{dataset.rowCount} interactions</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uploaded: {dataset.uploadDate} • Size: {dataset.fileSize}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => previewDataset(dataset)}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportDataset(dataset)}
                        className="text-accent hover:text-accent hover:bg-accent/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {activeDataset === dataset.id ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={deactivateDataset}
                          className="text-warning hover:text-warning hover:bg-warning/10"
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => activateDataset(dataset.id)}
                          className="text-success hover:text-success hover:bg-success/10"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDataset(dataset.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            {previewData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Dataset Preview (First 10 rows)</h3>
                  <Badge variant="secondary">{previewData.length} rows shown</Badge>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {previewData.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`
                          ${item.severity === 'severe' ? 'bg-severe text-white' : 
                            item.severity === 'moderate' ? 'bg-moderate text-white' : 
                            item.severity === 'mild' ? 'bg-mild text-white' : 
                            'bg-safe text-white'}
                        `}>
                          {item.severity}
                        </Badge>
                        <span className="font-medium">{item.drug1} + {item.drug2}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      {item.recommendation && (
                        <p className="text-sm text-primary mt-1">
                          <strong>Rec:</strong> {item.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a dataset to preview its contents</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
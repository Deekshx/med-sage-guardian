import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  FileText,
  Search,
  Plus,
  X
} from "lucide-react";

interface DrugEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

interface InteractionResult {
  severity: 'severe' | 'moderate' | 'mild' | 'safe';
  drugs: string[];
  description: string;
  recommendation: string;
}

const mockInteractions: InteractionResult[] = [
  {
    severity: 'severe',
    drugs: ['Warfarin', 'Aspirin'],
    description: 'Increased risk of bleeding when used together',
    recommendation: 'Consider alternative antiplatelet therapy or adjust warfarin dosing with frequent monitoring'
  },
  {
    severity: 'moderate',
    drugs: ['Metformin', 'Contrast Agent'],
    description: 'Risk of lactic acidosis with contrast procedures',
    recommendation: 'Discontinue metformin 48 hours before and after contrast administration'
  }
];

const mockAlternatives = [
  { drug: 'Aspirin', alternatives: ['Clopidogrel', 'Prasugrel', 'Ticagrelor'] },
  { drug: 'Warfarin', alternatives: ['Rivaroxaban', 'Apixaban', 'Dabigatran'] }
];

export default function DrugInteractionDashboard() {
  const [drugs, setDrugs] = useState<DrugEntry[]>([]);
  const [patientAge, setPatientAge] = useState<string>('');
  const [currentDrug, setCurrentDrug] = useState({ name: '', dosage: '', frequency: '' });
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<InteractionResult[]>([]);

  const addDrug = () => {
    if (currentDrug.name.trim()) {
      const newDrug: DrugEntry = {
        id: Date.now().toString(),
        ...currentDrug
      };
      setDrugs([...drugs, newDrug]);
      setCurrentDrug({ name: '', dosage: '', frequency: '' });
    }
  };

  const removeDrug = (id: string) => {
    setDrugs(drugs.filter(drug => drug.id !== id));
  };

  const analyzeInteractions = async () => {
    setAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setResults(mockInteractions);
      setAnalyzing(false);
    }, 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-severe text-white';
      case 'moderate': return 'bg-moderate text-white';
      case 'mild': return 'bg-mild text-white';
      case 'safe': return 'bg-safe text-white';
      default: return 'bg-muted';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe': return <AlertTriangle className="h-4 w-4" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4" />;
      case 'mild': return <AlertTriangle className="h-4 w-4" />;
      case 'safe': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card shadow-soft border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Drug Interaction Analyzer</h1>
              <p className="text-sm text-muted-foreground">Safe medication management system</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Drug Entry Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="age">Patient Age</Label>
                  <div className="relative mt-2">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter patient age"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Add Medications</h3>
                  
                  <div>
                    <Label htmlFor="drugName">Drug Name</Label>
                    <Input
                      id="drugName"
                      placeholder="e.g., Aspirin"
                      value={currentDrug.name}
                      onChange={(e) => setCurrentDrug({...currentDrug, name: e.target.value})}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        placeholder="81mg"
                        value={currentDrug.dosage}
                        onChange={(e) => setCurrentDrug({...currentDrug, dosage: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        placeholder="Daily"
                        value={currentDrug.frequency}
                        onChange={(e) => setCurrentDrug({...currentDrug, frequency: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Button onClick={addDrug} className="w-full bg-gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>

                {drugs.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground">Current Medications</h3>
                      {drugs.map((drug) => (
                        <div key={drug.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{drug.name}</p>
                            <p className="text-xs text-muted-foreground">{drug.dosage} • {drug.frequency}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDrug(drug.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={analyzeInteractions} 
                      disabled={analyzing || drugs.length < 2}
                      className="w-full bg-gradient-accent"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {analyzing ? 'Analyzing...' : 'Analyze Interactions'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {results.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <Pill className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Analyze</h3>
                  <p className="text-muted-foreground text-center">
                    Add at least 2 medications to check for potential interactions
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Interaction Results */}
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      Drug Interaction Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.map((result, index) => (
                      <Alert key={index} className="shadow-alert">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(result.severity)}
                          <div className="flex-1">
                            <AlertTitle className="flex items-center gap-2 mb-2">
                              <Badge className={`${getSeverityColor(result.severity)} capitalize`}>
                                {result.severity}
                              </Badge>
                              <span>{result.drugs.join(' + ')}</span>
                            </AlertTitle>
                            <AlertDescription className="space-y-2">
                              <p>{result.description}</p>
                              <div className="p-3 bg-primary/5 rounded-lg border-l-4 border-l-primary">
                                <p className="text-sm font-medium text-primary">Recommendation:</p>
                                <p className="text-sm text-foreground">{result.recommendation}</p>
                              </div>
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>

                {/* Alternative Medications */}
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      Alternative Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockAlternatives.map((alt, index) => (
                        <div key={index} className="p-4 bg-success/5 rounded-lg border border-success/20">
                          <h4 className="font-semibold text-foreground mb-2">Instead of {alt.drug}:</h4>
                          <div className="flex flex-wrap gap-2">
                            {alt.alternatives.map((alternative, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-success/10 text-success border-success/30">
                                {alternative}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
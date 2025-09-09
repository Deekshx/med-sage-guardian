import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DatasetManager from "@/components/DatasetManager";
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  FileText,
  Search,
  Plus,
  X,
  Database
} from "lucide-react";

interface DrugEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

interface DrugInteractionData {
  drug1: string;
  drug2: string;
  severity: 'severe' | 'moderate' | 'mild' | 'safe';
  description: string;
  recommendation: string;
  mechanism?: string;
  evidence_level?: string;
  allergic_reactions?: string[];
  contraindications?: string[];
}

interface InteractionResult {
  severity: 'severe' | 'moderate' | 'mild' | 'safe';
  drugs: string[];
  description: string;
  recommendation: string;
}

interface AllergyAlert {
  drug: string;
  allergen: string;
  severity: 'severe' | 'moderate' | 'mild';
  symptoms: string;
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
  const [patientAllergies, setPatientAllergies] = useState<string>('');
  const [currentDrug, setCurrentDrug] = useState({ name: '', dosage: '', frequency: '' });
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<InteractionResult[]>([]);
  const [allergyAlerts, setAllergyAlerts] = useState<AllergyAlert[]>([]);
  const [activeDataset, setActiveDataset] = useState<DrugInteractionData[] | null>(null);

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

  const checkAllergies = (drugs: DrugEntry[], allergies: string[]): AllergyAlert[] => {
    const alerts: AllergyAlert[] = [];
    const commonAllergicReactions: Record<string, { allergens: string[], symptoms: string, severity: 'severe' | 'moderate' | 'mild' }> = {
      'penicillin': { allergens: ['penicillin', 'amoxicillin', 'ampicillin'], symptoms: 'Rash, hives, swelling, difficulty breathing', severity: 'severe' },
      'sulfa': { allergens: ['sulfamethoxazole', 'trimethoprim', 'sulfasalazine'], symptoms: 'Skin rash, fever, nausea', severity: 'moderate' },
      'aspirin': { allergens: ['aspirin', 'acetylsalicylic acid'], symptoms: 'Breathing problems, hives, stomach upset', severity: 'moderate' },
      'iodine': { allergens: ['iodine', 'contrast dye'], symptoms: 'Skin reactions, breathing difficulties', severity: 'severe' },
      'latex': { allergens: ['latex'], symptoms: 'Skin irritation, respiratory symptoms', severity: 'mild' }
    };

    drugs.forEach(drug => {
      allergies.forEach(allergy => {
        const allergyLower = allergy.toLowerCase().trim();
        const drugLower = drug.name.toLowerCase();
        
        // Direct match
        if (drugLower.includes(allergyLower) || allergyLower.includes(drugLower)) {
          alerts.push({
            drug: drug.name,
            allergen: allergy,
            severity: 'severe',
            symptoms: 'Allergic reaction possible',
            recommendation: `AVOID ${drug.name} - Patient is allergic to ${allergy}`
          });
        }
        
        // Check against common allergic reactions
        Object.entries(commonAllergicReactions).forEach(([allergen, info]) => {
          if (allergyLower.includes(allergen) && 
              info.allergens.some(a => drugLower.includes(a))) {
            alerts.push({
              drug: drug.name,
              allergen: allergy,
              severity: info.severity,
              symptoms: info.symptoms,
              recommendation: `CONTRAINDICATED - ${drug.name} contains ${allergen} which patient is allergic to`
            });
          }
        });
      });
    });

    return alerts;
  };

  const analyzeInteractions = async () => {
    setAnalyzing(true);
    
    setTimeout(() => {
      let foundInteractions: InteractionResult[] = [];
      let foundAllergies: AllergyAlert[] = [];
      
      // Check allergies if patient has any listed
      if (patientAllergies.trim()) {
        const allergiesList = patientAllergies.split(',').map(a => a.trim()).filter(a => a);
        foundAllergies = checkAllergies(drugs, allergiesList);
      }
      
      if (activeDataset && activeDataset.length > 0) {
        // Use uploaded dataset for analysis
        for (let i = 0; i < drugs.length; i++) {
          for (let j = i + 1; j < drugs.length; j++) {
            const drug1 = drugs[i].name.toLowerCase();
            const drug2 = drugs[j].name.toLowerCase();
            
            const interaction = activeDataset.find(item => 
              (item.drug1.toLowerCase().includes(drug1) && item.drug2.toLowerCase().includes(drug2)) ||
              (item.drug1.toLowerCase().includes(drug2) && item.drug2.toLowerCase().includes(drug1)) ||
              (item.drug1.toLowerCase() === drug1 && item.drug2.toLowerCase() === drug2) ||
              (item.drug1.toLowerCase() === drug2 && item.drug2.toLowerCase() === drug1)
            );
            
            if (interaction) {
              foundInteractions.push({
                severity: interaction.severity,
                drugs: [drugs[i].name, drugs[j].name],
                description: interaction.description,
                recommendation: interaction.recommendation
              });
            }
          }
        }
      } else {
        // Use mock data if no dataset is active
        foundInteractions = mockInteractions;
      }
      
      setResults(foundInteractions);
      setAllergyAlerts(foundAllergies);
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
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Drug Analysis
            </TabsTrigger>
            <TabsTrigger value="dataset" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Dataset Management
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis">
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

                    <div>
                      <Label htmlFor="allergies">Known Allergies</Label>
                      <div className="relative mt-2">
                        <AlertTriangle className="absolute left-3 top-3 h-4 w-4 text-warning" />
                        <Input
                          id="allergies"
                          placeholder="e.g., Penicillin, Sulfa, Aspirin (comma separated)"
                          value={patientAllergies}
                          onChange={(e) => setPatientAllergies(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter known allergies separated by commas
                      </p>
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
                {results.length === 0 && allergyAlerts.length === 0 ? (
                  <Card className="shadow-card">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Pill className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Analyze</h3>
                      <p className="text-muted-foreground text-center">
                        Add medications to check for interactions and allergies
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {/* Allergy Alerts - Show first with highest priority */}
                    {allergyAlerts.length > 0 && (
                      <Card className="shadow-alert border-destructive/20">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            ⚠️ ALLERGY ALERTS
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {allergyAlerts.map((alert, index) => (
                            <Alert key={index} className="border-destructive/30 bg-destructive/5">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                                <div className="flex-1">
                                  <AlertTitle className="flex items-center gap-2 mb-2 text-destructive">
                                    <Badge className="bg-destructive text-white">
                                      {alert.severity.toUpperCase()} ALLERGY
                                    </Badge>
                                    <span className="font-bold">{alert.drug}</span>
                                  </AlertTitle>
                                  <AlertDescription className="space-y-2">
                                    <p><strong>Allergen:</strong> {alert.allergen}</p>
                                    <p><strong>Potential Symptoms:</strong> {alert.symptoms}</p>
                                    <div className="p-3 bg-destructive/10 rounded-lg border-l-4 border-l-destructive">
                                      <p className="text-sm font-bold text-destructive">URGENT:</p>
                                      <p className="text-sm text-foreground">{alert.recommendation}</p>
                                    </div>
                                  </AlertDescription>
                                </div>
                              </div>
                            </Alert>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                    {/* Interaction Results */}
                    {results.length > 0 && (
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
                    )}

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
          </TabsContent>
          
          <TabsContent value="dataset">
            <DatasetManager onDatasetChange={setActiveDataset} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
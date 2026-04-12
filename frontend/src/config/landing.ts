import {
  Users,
  Clock,
  Target,
  Brain,
  Globe,
  BarChart3,
  Zap,
  TrendingUp,
  Shield,
  Database,
  Server,
  Code,
  Layers,
  Microscope,
  Building2,
  Landmark,
  Hospital,
  Factory,
  Upload,
  Settings,
  CheckCircle2,
  FileText,
  Lock,
  Award,
  BadgeCheck,
  FileCheck,
  Coins,
  HeartPulse,
  Rocket,
  Check,
  X,
} from 'lucide-react'

export const problems = [
  {
    icon: Users,
    title: 'High Inter-Analyst Variability',
    description: 'Manual colony counting produces inconsistent results. Two analysts counting the same plate differ by 10-25%.',
    stat: '22.7-80%',
    statLabel: 'Coefficient of Variation',
    source: 'ASTM F2944 / Scintica (2024)',
  },
  {
    icon: Clock,
    title: 'Critical Throughput Bottleneck',
    description: 'A single analyst processes only 20-40 plates per hour, creating significant backlogs.',
    stat: '20-40',
    statLabel: 'Plates per Hour',
    source: 'Indonesian Lab Industry Survey (2024)',
  },
  {
    icon: Target,
    title: 'Experience-Dependent Accuracy',
    description: 'Accurate differentiation requires substantial training. Under-resourced labs struggle to reliably distinguish colonies.',
    stat: '40-60%',
    statLabel: 'of Analyst Working Hours',
    source: 'Indonesian Lab Industry Survey (2024)',
  },
]

export const targetAudience = [
  {
    icon: Factory,
    title: 'Food Industry Manufacturers',
    description: 'FMCG, dairy, and beverage companies depend on rapid TPC results for production release and shelf-life validation.',
  },
  {
    icon: Landmark,
    title: 'Government Regulators',
    description: 'BPOM and Dinas Kesehatan require standardized, auditable microbial testing records for product certification.',
  },
  {
    icon: Building2,
    title: 'Third-Party Testing Labs',
    description: 'KAN-accredited laboratories face increasing sample volumes with limited analyst resources.',
  },
  {
    icon: Hospital,
    title: 'Hospitals & Clinical Labs',
    description: 'Environmental monitoring and food safety testing directly impacts patient safety protocols.',
  },
]

export const howItWorks = [
  { step: 1, icon: Upload, title: 'Upload Image', description: 'Analyst uploads plate photo with sample ID, dilution factor, and media type.' },
  { step: 2, icon: Settings, title: 'Pre-Process', description: 'OpenCV normalizes brightness, corrects perspective, and extracts plate boundary.' },
  { step: 3, icon: Brain, title: 'AI Inference', description: 'YOLOv8 classifies all objects into 5 classes with confidence scores.' },
  { step: 4, icon: BarChart3, title: 'CFU Calculation', description: 'Automated CFU/ml calculation with TNTC/TFTC flagging.' },
  { step: 5, icon: FileText, title: 'Export & Report', description: 'Analyst reviews, approves, and exports PDF/CSV or syncs to LIMS.' },
]

export const solutions = [
  {
    icon: Brain,
    title: 'AI Vision Engine',
    description: 'YOLOv8 object detection trained on 18,000+ images across 8+ agar media types.',
    features: ['≥92% detection accuracy', '5-class simultaneous classification', '<50ms inference time', 'Media-agnostic training'],
  },
  {
    icon: Globe,
    title: 'Web Dashboard',
    description: 'Next.js 14 application providing real-time annotation and analytics.',
    features: ['Color-coded bounding boxes', 'Historical test records', 'Trend analytics', 'Role-based access control'],
  },
  {
    icon: BarChart3,
    title: 'Simulator & Reporting',
    description: 'Benchmark AI accuracy against manual counts with automated reporting.',
    features: ['PDF/CSV export', 'LIMS API integration', 'Side-by-side comparison', 'Automated TNTC/TFTC flags'],
  },
]

export const benefits = [
  { stat: '85-90%', label: 'Time Reduction', description: 'From 15-30 min to under 2 min per sample', icon: Zap },
  { stat: '5-8×', label: 'Throughput Increase', description: 'More samples processed per analyst per day', icon: TrendingUp },
  { stat: '≥92%', label: 'Detection Accuracy', description: 'Across diverse media types and lighting', icon: Target },
  { stat: '>90%', label: 'Artifact Rejection', description: 'Precision in excluding non-colony objects', icon: Shield },
  { stat: '40%', label: 'Cost Reduction', description: 'Estimated labor cost savings per TPC test', icon: Coins },
  { stat: 'ISO 17025', label: 'Compliance Ready', description: 'Digital audit trail with analyst sign-off', icon: BadgeCheck },
]

export const competitiveComparison = [
  { feature: '5-Class Detection', colonyai: true, manual: false, protocol: 'Partial', sphereflash: 'Partial', genericAI: false },
  { feature: 'Artifact Differentiation', colonyai: true, manual: false, protocol: 'Partial', sphereflash: 'Partial', genericAI: false },
  { feature: 'No Special Hardware', colonyai: true, manual: true, protocol: false, sphereflash: false, genericAI: true },
  { feature: 'Indonesian Regulatory', colonyai: true, manual: false, protocol: false, sphereflash: false, genericAI: false },
  { feature: 'LIMS Integration', colonyai: true, manual: false, protocol: 'Limited', sphereflash: 'Limited', genericAI: 'Custom' },
  { feature: 'SaaS / Cloud Access', colonyai: true, manual: false, protocol: false, sphereflash: false, genericAI: true },
  { feature: 'Confidence per Class', colonyai: true, manual: false, protocol: false, sphereflash: false, genericAI: 'Partial' },
  { feature: 'Monthly Cost', colonyai: 'IDR 500K+', manual: 'Analyst salary', protocol: '>USD 15K HW', sphereflash: '>USD 30K HW', genericAI: 'Custom' },
]

export const securityFeatures = [
  { icon: Lock, title: 'Encrypted Storage', description: 'AWS S3 encryption at rest and in transit' },
  { icon: Shield, title: 'RBAC Access', description: '6-role system per ISO 17025 Cl. 5.2' },
  { icon: FileCheck, title: 'Audit Trail', description: 'Append-only PostgreSQL logs with timestamps' },
  { icon: BadgeCheck, title: 'ISO 17025 Ready', description: 'Digital sign-off workflow for accreditation' },
]

export const differentiation = [
  { icon: Brain, title: '5-Class Artifact Intelligence', description: 'Specifically trained to classify all 5 object classes with >90% precision. Generic APIs cannot perform this.' },
  { icon: Target, title: 'Confidence Transparency', description: 'Every detection shows per-class confidence scores. Analysts see exactly where the model is uncertain.' },
  { icon: Globe, title: 'Media-Agnostic Architecture', description: 'Trained across 8+ agar media types. Competitors typically train on a single media type.' },
  { icon: Landmark, title: 'Indonesia-Contextual Design', description: 'Built around BPOM/SNI reporting formats and Bahasa Indonesia interface.' },
  { icon: Zap, title: 'No Hardware Lock-in', description: 'Requires only a standard camera. Competitors need proprietary hardware costing USD 15,000-60,000.' },
]

export const roadmap = [
  { sprint: 'Sprint 1', title: 'Foundation', status: 'completed', items: ['Project setup', 'Database schema', 'Auth system'] },
  { sprint: 'Sprint 2', title: 'AI Model', status: 'completed', items: ['YOLOv8 training', '5-class dataset', 'Model validation'] },
  { sprint: 'Sprint 3', title: 'Core Features', status: 'completed', items: ['Image upload', 'AI inference API', 'Dashboard UI'] },
  { sprint: 'Sprint 4', title: 'Reporting', status: 'in-progress', items: ['PDF export', 'CSV export', 'Simulator module'] },
  { sprint: 'Sprint 5', title: 'Launch', status: 'upcoming', items: ['LIMS integration', 'Performance testing', 'Production deploy'] },
]

export const dataCredibility = [
  { value: '18,000+', label: 'Training Images', sub: 'AGAR Public Dataset' },
  { value: '8+', label: 'Media Types', sub: 'PCA, VRBA, BGBB, etc.' },
  { value: '3×', label: 'Augmentation', sub: 'Roboflow Pipeline' },
  { value: '0.94', label: 'mAP@0.5', sub: 'Model Precision' },
]

export const techStack = [
  { name: 'YOLOv8', category: 'AI Model', icon: Brain },
  { name: 'FastAPI', category: 'Backend', icon: Zap },
  { name: 'Next.js 14', category: 'Frontend', icon: Globe },
  { name: 'TypeScript', category: 'Language', icon: Code },
  { name: 'PostgreSQL', category: 'Database', icon: Database },
  { name: 'OpenCV', category: 'Image Processing', icon: Microscope },
  { name: 'AWS S3', category: 'Storage', icon: Layers },
  { name: 'Docker', category: 'Deployment', icon: Server },
]

export const detectionClasses = [
  { name: 'Colony Single', color: 'bg-green-500', description: 'Individual bacterial colonies' },
  { name: 'Colony Merged', color: 'bg-blue-500', description: 'Overlapping colonies' },
  { name: 'Bubble', color: 'bg-yellow-500', description: 'Air bubbles (excluded)' },
  { name: 'Dust/Debris', color: 'bg-orange-500', description: 'Contaminants (excluded)' },
  { name: 'Media Crack', color: 'bg-red-500', description: 'Plate damage (excluded)' },
]

export const faqs = [
  {
    question: 'How accurate is ColonyAI compared to manual counting?',
    answer: 'ColonyAI achieves ≥92% detection accuracy across diverse media types, significantly reducing the 22.7%-80% coefficient of variation seen in manual counting.'
  },
  {
    question: 'What media types are supported?',
    answer: 'Our model is trained on 8+ agar media types including PCA, VRBA, BGBB, R2A, TSA, and MacConkey, with support for more types continuously expanding.'
  },
  {
    question: 'Do I need special hardware?',
    answer: 'No. ColonyAI works with any standard camera or smartphone. Unlike alternatives like ProtoCOL 3 or SphereFlash, no proprietary hardware is required.'
  },
  {
    question: 'Is the data secure and compliant?',
    answer: 'Yes. All data is encrypted at rest and in transit. Our audit trail supports ISO 17025 compliance with timestamped records and analyst sign-off.'
  },
  {
    question: 'Can I integrate with my existing LIMS?',
    answer: 'Absolutely. ColonyAI supports integration with major LIMS platforms including SampleManager and LabVantage through our REST API.'
  },
]

export const teamMembers = [
  { name: 'Wisnu Alfian Nur Ashar', role: 'Product Owner & Frontend Lead', email: 'wisnu.ashar@student.president.ac.id', github: 'wi5nuu' },
  { name: 'Muhammad Faras', role: 'Scrum Master & AI Integration', email: '', github: '' },
  { name: 'Suci', role: 'UI/UX Designer', email: '', github: '' },
  { name: 'Steven', role: 'Data Analyst & QA Engineer', email: '', github: '' },
]

export const footerLinks = {
  product: [
    { label: 'Features', href: '#solution' },
    { label: 'Roadmap', href: '#roadmap' },
    { label: 'API Docs', href: 'https://github.com/wi5nuu/colonyai' },
  ],
  resources: [
    { label: 'Documentation', href: 'https://github.com/wi5nuu/colonyai' },
    { label: 'Dataset', href: 'https://doi.org/10.1038/s41598-021-99300-z' },
    { label: 'References', href: 'https://github.com/wi5nuu/colonyai' },
    { label: 'Support', href: 'mailto:wisnu.ashar@student.president.ac.id' },
  ],
  company: [
    { label: 'Team', href: '#team' },
    { label: 'Contact', href: 'mailto:wisnu.ashar@student.president.ac.id' },
    { label: 'GitHub', href: 'https://github.com/wi5nuu/colonyai' },
    { label: 'President University', href: 'https://www.president.ac.id' },
  ],
}

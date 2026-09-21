'use client';
import {useState} from 'react';
import {Button,Badge,Avatar,Card,Alert,Separator,Skeleton,Label,Kbd,Input,Textarea,Checkbox,RadioGroup,Switch,Slider,Field,InputGroup,Select,Combobox,Accordion,Tabs,Collapsible,Breadcrumb,Pagination,Progress,Spinner,EmptyState,Table,DataTable,Dialog,AlertDialog,Drawer,Sheet,Popover,Tooltip,Dropdown,ContextMenu,HoverCard,NavigationMenu,Sidebar,Toggle,ToggleGroup,NumberField,Command,Calendar,DatePicker,Toast,FileUpload} from './index';
function ButtonDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="button"><div className="cr-demo-content"><Button>Continue</Button></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function BadgeDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="badge"><div className="cr-demo-content"><Badge variant="success">Active</Badge></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function AvatarDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="avatar"><div className="cr-demo-content"><Avatar name="Alex Morgan"/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function CardDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="card"><div className="cr-demo-content"><Card title="Project settings" description="Make this workspace your own.">Your content goes here.</Card></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function AlertDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="alert"><div className="cr-demo-content"><Alert title="Everything is up to date." variant="success">Your changes have been saved.</Alert></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function SeparatorDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="separator"><div className="cr-demo-content"><div>Account<Separator/>Preferences</div></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function SkeletonDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="skeleton"><div className="cr-demo-content"><div style={{width:240,display:"grid",gap:12}}><Skeleton style={{height:20,width:"60%"}}/><Skeleton style={{height:80}}/></div></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function LabelDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="label"><div className="cr-demo-content"><div><Label htmlFor="label-demo">Full name</Label><input id="label-demo" className="cr-input"/></div></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function KbdDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="kbd"><div className="cr-demo-content"><span>Open search <Kbd>⌘ K</Kbd></span></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function InputDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="input"><div className="cr-demo-content"><Input aria-label="Email address" type="email" placeholder="you@company.com"/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function TextareaDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="textarea"><div className="cr-demo-content"><Textarea aria-label="Project description" placeholder="Tell us about your project…"/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function CheckboxDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="checkbox"><div className="cr-demo-content"><Checkbox label="Send me product updates" defaultChecked/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function RadioGroupDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="radio-group"><div className="cr-demo-content"><RadioGroup label="Plan" defaultValue="personal" options={[{value:"personal",label:"Personal"},{value:"team",label:"Team"}]}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function SwitchDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="switch"><div className="cr-demo-content"><Switch label="Email notifications" defaultChecked/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function SliderDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="slider"><div className="cr-demo-content"><Slider label="Volume" defaultValue={40} min={0} max={100}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function FieldDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="field"><div className="cr-demo-content"><Field label="Email" description="We’ll use this for account updates."><Input type="email" placeholder="you@company.com"/></Field></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function InputGroupDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="input-group"><div className="cr-demo-content"><InputGroup aria-label="Website" leading="https://" placeholder="your-company.com"/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function SelectDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="select"><div className="cr-demo-content"><Select label="Timezone" defaultValue="paris" options={[{value:"paris",label:"Europe / Paris"},{value:"new-york",label:"America / New York"}]}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function ComboboxDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="combobox"><div className="cr-demo-content"><Combobox label="Framework" items={["React","Vue","Svelte","SolidJS"]}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function AccordionDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="accordion"><div className="cr-demo-content"><Accordion items={[{value:"ownership",title:"Do I own the code?",content:"Yes. Export it and use it in your own project."},{value:"runtime",title:"Does it need a server?",content:"The exported components run independently."}]}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function TabsDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="tabs"><div className="cr-demo-content"><Tabs label="Account" items={[{value:"profile",label:"Profile",content:"Your profile settings."},{value:"notifications",label:"Notifications",content:"Choose how you stay informed."}]}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function CollapsibleDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="collapsible"><div className="cr-demo-content"><Collapsible title="Advanced options">Additional settings for this workspace.</Collapsible></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function BreadcrumbDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="breadcrumb"><div className="cr-demo-content"><Breadcrumb items={[{label:"Workspace",href:"#workspace"},{label:"Settings",href:"#settings"},{label:"Profile"}]}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function PaginationDemo(){const [page,setPage]=useState(2);const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="pagination"><div className="cr-demo-content"><Pagination page={page} totalPages={8} onPageChange={setPage}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function ProgressDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="progress"><div className="cr-demo-content"><Progress label="Upload progress" value={65}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function SpinnerDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="spinner"><div className="cr-demo-content"><Spinner label="Loading your workspace"/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function EmptyStateDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="empty-state"><div className="cr-demo-content"><EmptyState title="No projects yet" description="Create your first project to get started." action={<Button>Create project</Button>}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function TableDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="table"><div className="cr-demo-content"><Table caption="Team members" columns={["Name","Role"]} rows={[["Alex Morgan","Owner"],["Sam Taylor","Developer"]]}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function DataTableDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="data-table"><div className="cr-demo-content"><DataTable
  caption="Recent payments"
  searchPlaceholder="Filter by customer, status or invoice…"
  pageSize={5}
  columns={[
    { key: "id", label: "Invoice" },
    { key: "status", label: "Status", render: value => (
      <Badge variant={value === "Paid" ? "success" : value === "Pending" ? "warning" : "secondary"}>{value}</Badge>
    ) },
    { key: "customer", label: "Customer" },
    { key: "amount", label: "Amount", render: value => (
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value))}</span>
    ) },
  ]}
  rows={[
  {
    "id": "INV-1048",
    "customer": "olivia.martin@example.com",
    "status": "Paid",
    "amount": 129
  },
  {
    "id": "INV-1047",
    "customer": "jackson.lee@example.com",
    "status": "Processing",
    "amount": 249
  },
  {
    "id": "INV-1046",
    "customer": "sophia.brown@example.com",
    "status": "Paid",
    "amount": 89
  },
  {
    "id": "INV-1045",
    "customer": "noah.williams@example.com",
    "status": "Pending",
    "amount": 399
  },
  {
    "id": "INV-1044",
    "customer": "ava.robinson@example.com",
    "status": "Paid",
    "amount": 149
  },
  {
    "id": "INV-1043",
    "customer": "liam.thompson@example.com",
    "status": "Refunded",
    "amount": 79
  },
  {
    "id": "INV-1042",
    "customer": "emma.davis@example.com",
    "status": "Paid",
    "amount": 299
  },
  {
    "id": "INV-1041",
    "customer": "lucas.wilson@example.com",
    "status": "Pending",
    "amount": 199
  }
]}
/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function DialogDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="dialog"><div className="cr-demo-content"><Dialog trigger="Open dialog" title="Workspace settings" description="Manage the details of your workspace."><Input aria-label="Workspace name" placeholder="Acme"/></Dialog></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function AlertDialogDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="alert-dialog"><div className="cr-demo-content"><AlertDialog trigger="Preview confirmation" title="Review before continuing" description="Important changes deserve a final check." closeLabel="Cancel"><p>This is a confirmation preview. No data will be changed. In your application, explain the consequences here before asking the user to confirm.</p></AlertDialog></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function DrawerDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="drawer"><div className="cr-demo-content"><Drawer trigger="Open drawer" title="Workspace settings" description="Manage the details of your workspace."><Input aria-label="Workspace name" placeholder="Acme"/></Drawer></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function SheetDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="sheet"><div className="cr-demo-content"><Sheet trigger="Open sheet" title="Workspace settings" description="Manage the details of your workspace."><Input aria-label="Workspace name" placeholder="Acme"/></Sheet></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function PopoverDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="popover"><div className="cr-demo-content"><Popover trigger="Set dimensions" title="Dimensions"><Input aria-label="Width" placeholder="Width"/></Popover></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function TooltipDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="tooltip"><div className="cr-demo-content"><Tooltip trigger="Save" content="Save your changes to this library"/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function DropdownDemo(){const [notice,setNotice]=useState('');return <div className="cr-demo" data-component="dropdown"><div className="cr-demo-content"><Dropdown trigger="Project actions" items={[{label:"Rename",onSelect:()=>setNotice(String("Rename")+" selected")},{label:"Archive",onSelect:()=>setNotice(String("Archive")+" selected")} ]}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function ContextMenuDemo(){const [notice,setNotice]=useState('');return <div className="cr-demo" data-component="context-menu"><div className="cr-demo-content"><ContextMenu items={[{label:"Open",onSelect:()=>setNotice(String("Open")+" selected")},{label:"Duplicate",onSelect:()=>setNotice(String("Duplicate")+" selected")}]}>Right-click here, or press Shift + F10.</ContextMenu></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function HoverCardDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="hover-card"><div className="cr-demo-content"><HoverCard label="@alex" href="#profile"><strong>Alex Morgan</strong><p className="cr-description">Designer and developer.</p></HoverCard></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function NavigationMenuDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="navigation-menu"><div className="cr-demo-content"><NavigationMenu items={[{label:"Product",links:[{label:"Overview",href:"#overview",description:"Explore the platform."},{label:"Components",href:"#components"}]}]}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function SidebarDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="sidebar"><div className="cr-demo-content"><Sidebar brand="Acme" items={[{label:"Overview",href:"#overview",active:true},{label:"Projects",href:"#projects"},{label:"Settings",href:"#settings"}]}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function ToggleDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="toggle"><div className="cr-demo-content"><Toggle aria-label="Bold text">B</Toggle></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function ToggleGroupDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="toggle-group"><div className="cr-demo-content"><ToggleGroup label="Text alignment" items={[{value:"left",label:"Left"},{value:"center",label:"Center"},{value:"right",label:"Right"}]}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function NumberFieldDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="number-field"><div className="cr-demo-content"><NumberField label="Team size" defaultValue={5} min={1} max={100}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function CommandDemo(){const [notice,setNotice]=useState('');return <div className="cr-demo" data-component="command"><div className="cr-demo-content"><Command items={[{value:"settings",label:"Open settings",onSelect:()=>setNotice(String("Settings")+" selected")},{value:"export",label:"Export library",onSelect:()=>setNotice(String("Export")+" selected")}]} /></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function CalendarDemo(){const [notice,setNotice]=useState('');return <div className="cr-demo" data-component="calendar"><div className="cr-demo-content"><Calendar defaultValue="2026-09-17" onValueChange={date=>setNotice(String(date)+" selected")}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function DatePickerDemo(){const [notice,setNotice]=useState('');return <div className="cr-demo" data-component="date-picker"><div className="cr-demo-content"><DatePicker mode="range" label="Project dates" defaultValue={{start:"2026-09-17",end:"2026-09-23"}} autoApply={false} onValueChange={range=>setNotice(String(range ? range.start + " – " + range.end : "Cleared")+" selected")}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function ToastDemo(){const [notice,_setNotice]=useState('');return <div className="cr-demo" data-component="toast"><div className="cr-demo-content"><Toast/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
function FileUploadDemo(){const [notice,setNotice]=useState('');return <div className="cr-demo" data-component="file-upload"><div className="cr-demo-content"><FileUpload label="Project attachment" onFileSelect={file=>setNotice(String(file.name)+" selected")}/></div>{notice&&<p role="status" className="cr-description" style={{marginTop:12}}>{notice}</p>}</div>}
export const componentDemos={"button":ButtonDemo,"badge":BadgeDemo,"avatar":AvatarDemo,"card":CardDemo,"alert":AlertDemo,"separator":SeparatorDemo,"skeleton":SkeletonDemo,"label":LabelDemo,"kbd":KbdDemo,"input":InputDemo,"textarea":TextareaDemo,"checkbox":CheckboxDemo,"radio-group":RadioGroupDemo,"switch":SwitchDemo,"slider":SliderDemo,"field":FieldDemo,"input-group":InputGroupDemo,"select":SelectDemo,"combobox":ComboboxDemo,"accordion":AccordionDemo,"tabs":TabsDemo,"collapsible":CollapsibleDemo,"breadcrumb":BreadcrumbDemo,"pagination":PaginationDemo,"progress":ProgressDemo,"spinner":SpinnerDemo,"empty-state":EmptyStateDemo,"table":TableDemo,"data-table":DataTableDemo,"dialog":DialogDemo,"alert-dialog":AlertDialogDemo,"drawer":DrawerDemo,"sheet":SheetDemo,"popover":PopoverDemo,"tooltip":TooltipDemo,"dropdown":DropdownDemo,"context-menu":ContextMenuDemo,"hover-card":HoverCardDemo,"navigation-menu":NavigationMenuDemo,"sidebar":SidebarDemo,"toggle":ToggleDemo,"toggle-group":ToggleGroupDemo,"number-field":NumberFieldDemo,"command":CommandDemo,"calendar":CalendarDemo,"date-picker":DatePickerDemo,"toast":ToastDemo,"file-upload":FileUploadDemo};
export function ComponentShowcase({slug}:{slug:string}){const Demo=componentDemos[slug as keyof typeof componentDemos];return Demo?<Demo/>:<p>Component unavailable.</p>}

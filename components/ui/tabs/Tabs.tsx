import TabsContent from "./components/TabsContent";
import TabsList from "./components/TabsList";
import TabsRoot from "./components/TabsRoot";
import TabsTrigger from "./components/TabsTrigger";

type TabsCompoundComponent = typeof TabsRoot & {
  Content: typeof TabsContent;
  List: typeof TabsList;
  Trigger: typeof TabsTrigger;
};

const Tabs = Object.assign(TabsRoot, {
  Content: TabsContent,
  List: TabsList,
  Trigger: TabsTrigger,
}) as TabsCompoundComponent;

export { Tabs };

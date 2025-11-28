import { CalendarDays, BadgeDollarSign, MessageCircleMore, Anvil, Settings } from "lucide-react"

import type { Dispatch, SetStateAction } from "react";
type View = "Calendar" | "Market" | "Chat" | "Forge" | "Settings";

import
{
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { GameState } from "@/game";

// Menu items.
const items = [
  {
    title: "Calendar",
    icon: CalendarDays,
  },
  {
    title: "Market",
    icon: BadgeDollarSign,
  },
  {
    title: "Forge",
    icon: Anvil,
  },
  {
    title: "Chat",
    icon: MessageCircleMore,
  },
  {
    title: "Settings",
    icon: Settings,
  },
]

interface Props
{
  setGame: Dispatch<SetStateAction<GameState>>
  currentView: View;
  setView: Dispatch<SetStateAction<View>>;
}

export function AppSidebar({ setGame, currentView, setView }: Props)
{
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Lecture Skipper</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button onClick={() =>
                    {
                      setView(item.title as View);
                      setGame((g) => ({ ...g, selectedItemSlots: [] }));
                    }} className={`flex items-center gap-2 p-1 ${currentView === item.title ? "ring-1 ring-gray-500" : ""}`}>
                      <item.icon />
                      <span className={currentView === item.title ? "font-bold" : ""}>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
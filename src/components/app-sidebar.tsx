import { CalendarDays, BadgeDollarSign, MessageCircleMore, Anvil, Settings } from "lucide-react"

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
import { changeView, type GameState, type View } from "@/game";
import type { Dispatch, SetStateAction } from "react";
import { Kbd } from "./ui/kbd";

// Menu items
const items: { title: View; icon: any }[] = [
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
  game: GameState;
  setGame: Dispatch<SetStateAction<GameState>>
}

export function AppSidebar({ game, setGame }: Props)
{
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Lecture Skipper</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, i) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <button onClick={() => setGame(prev => changeView(prev, item.title))} className={`flex items-center gap-2 p-1 ${game.view === item.title ? "ring-1 ring-gray-500" : ""}`}>
                      <item.icon />
                      <span className={game.view === item.title ? "font-bold" : ""}>{item.title}</span>
                      <Kbd className="ml-auto sm:visible invisible">{i + 1}</Kbd>
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
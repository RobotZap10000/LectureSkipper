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
const items: { title: View; icon: any, key: string }[] = [
  {
    title: "Calendar",
    icon: CalendarDays,
    key: "Q",
  },
  {
    title: "Market",
    icon: BadgeDollarSign,
    key: "W",
  },
  {
    title: "Forge",
    icon: Anvil,
    key: "E",
  },
  {
    title: "Chat",
    icon: MessageCircleMore,
    key: "R",
  },
  {
    title: "Settings",
    icon: Settings,
    key: "T",
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
                      <Kbd className="ml-auto md:visible invisible">{item.key}</Kbd>
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
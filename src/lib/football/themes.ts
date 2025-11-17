// Simple theme map per league for header gradient + chip background
export function themeFor(league: string) {
  switch (league) {
    case "iom-premier-league":
      return { accent: "from-red-500 to-red-600", chip: "bg-red-600/20" };
    case "iom-division-2":
      return { accent: "from-indigo-500 to-indigo-600", chip: "bg-indigo-600/20" };
    case "iom-combination-1":
      return { accent: "from-emerald-500 to-emerald-600", chip: "bg-emerald-600/20" };
    case "iom-combination-2":
      return { accent: "from-purple-500 to-purple-600", chip: "bg-purple-600/20" };
    default:
      return { accent: "from-gray-500 to-gray-600", chip: "bg-gray-600/20" };
  }
}
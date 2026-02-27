export async function POST(req: Request) {
    const { username, password } = await req.json()
  
    // Hardcoded credentials
    const users = [
      { username: "admin", password: "admin123", role: "admin" },
      { username: "hr_manager", password: "hr123", role: "hr" },
      { username: "manager_tz", password: "manager123", role: "manager" },
      { username: "cashier1", password: "cashier123", role: "cashier" }
    ]
  
    const user = users.find(
      u => u.username === username && u.password === password
    )
  
    if (!user) {
      return Response.json({ success: false }, { status: 401 })
    }
  
    return Response.json({
      success: true,
      role: user.role
    })
  }
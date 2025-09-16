import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

// Test data
const testProject = {
  projectName: "Test Project",
  projectDescription: "This is a test project",
  projectDeadline: new Date().toISOString(),
  status: "open",
  revenue: 10000
};

async function testEndpoints() {
  console.log("🧪 Testing Backend Endpoints...\n");

  try {
    // Test 1: Get all projects
    console.log("1. Testing GET /admin/projects");
    const projectsResponse = await axios.get(`${BASE_URL}/admin/projects`);
    console.log(`✅ Found ${projectsResponse.data.length} projects`);
    console.log("Sample project:", projectsResponse.data[0]?.projectName || "No projects found");
    console.log();

    // Test 2: Get all users
    console.log("2. Testing GET /admin/users");
    const usersResponse = await axios.get(`${BASE_URL}/admin/users`);
    console.log(`✅ Found ${usersResponse.data.length} users`);
    console.log("Sample user:", usersResponse.data[0]?.name || "No users found");
    console.log();

    // Test 3: Get assignable users
    console.log("3. Testing GET /admin/users/assignable");
    const assignableUsersResponse = await axios.get(`${BASE_URL}/admin/users/assignable`);
    console.log(`✅ Found ${assignableUsersResponse.data.length} assignable users`);
    console.log();

    // Test 4: Get assignable projects
    console.log("4. Testing GET /admin/projects/assignable");
    const assignableProjectsResponse = await axios.get(`${BASE_URL}/admin/projects/assignable`);
    console.log(`✅ Found ${assignableProjectsResponse.data.length} assignable projects`);
    console.log();

    console.log("🎉 All endpoint tests passed!");
    console.log("\n📋 Available Endpoints:");
    console.log("✅ GET /admin/projects - List all projects");
    console.log("✅ GET /admin/users - List all users");
    console.log("✅ GET /admin/users/assignable - List assignable users");
    console.log("✅ GET /admin/projects/assignable - List assignable projects");
    console.log("✅ PUT /admin/projects/:projectId - Update project");
    console.log("✅ DELETE /admin/projects/:projectId - Delete project");
    console.log("✅ DELETE /admin/users/:userId - Delete user");
    console.log("✅ POST /admin/projects/:projectId/assign - Assign project to users");
    console.log("✅ PATCH /admin/projects/:projectId/status - Change project status");

  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.log("\n🔧 Make sure:");
    console.log("1. Backend server is running on port 4000");
    console.log("2. MongoDB is connected");
    console.log("3. Users and projects are seeded");
  }
}

testEndpoints();

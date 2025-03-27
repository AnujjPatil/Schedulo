const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get the first server
    const server = await prisma.server.findFirst({
      include: {
        members: true
      }
    });

    if (!server) {
      console.log('No server found');
      return;
    }

    console.log(`Using server: ${server.name} (${server.id})`);

    // Get the first member (usually the admin)
    const member = server.members[0];

    if (!member) {
      console.log('No member found');
      return;
    }

    console.log(`Using member: ${member.id}`);

    // Create a test project
    const project = await prisma.project.create({
      data: {
        name: "Test Project",
        summary: "This is a test project created via script",
        description: "A detailed description of the test project",
        status: "BACKLOG",
        priority: "MEDIUM",
        serverId: server.id,
        leadId: member.id,
        members: {
          create: {
            memberId: member.id
          }
        }
      }
    });

    console.log('Project created successfully:');
    console.log(project);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
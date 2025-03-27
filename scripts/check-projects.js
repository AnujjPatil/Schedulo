const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all servers
    const servers = await prisma.server.findMany({
      include: {
        projects: true
      }
    });

    console.log('Servers with projects:');
    servers.forEach(server => {
      console.log(`Server: ${server.name} (${server.id})`);
      console.log(`Projects count: ${server.projects.length}`);
      
      if (server.projects.length > 0) {
        console.log('Projects:');
        server.projects.forEach(project => {
          console.log(`- ${project.name} (${project.id})`);
        });
      } else {
        console.log('No projects found for this server');
      }
      console.log('-------------------');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
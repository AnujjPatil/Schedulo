import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { initialProfile } from "@/lib/initial-profile";

const InviteCodePage = async ({
  params
}: {
  params: { inviteCode: string }
}) => {
  const profile = await initialProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  if (!params.inviteCode) {
    return redirect("/");
  }

  const existingServer = await db.server.findFirst({
    where: {
      inviteCode: params.inviteCode,
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  });

  if (existingServer) {
    return redirect(`/servers/${existingServer.id}`);
  }

  const server = await db.server.update({
    where: {
      inviteCode: params.inviteCode,
    },
    data: {
      members: {
        create: [
          {
            profileId: profile.id
          }
        ]
      }
    }
  });

  if (server) {
    return redirect(`/servers/${server.id}`);
  }

  return null;
}

export default InviteCodePage;

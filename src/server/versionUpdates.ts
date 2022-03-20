import { Entity, Field, IdEntity, Remult, SqlDatabase } from "remult";
import { PostgresSchemaBuilder } from "remult/postgres";
import { Group, GroupType } from "../Courses/Group.entity";
import { Roles } from "../Users/Roles";
import { TeacherRate, User } from "../Users/User.entity";


@Entity(undefined!, {
    dbName: "versionInfo"
})
export class VersionInfo extends IdEntity {
    @Field()
    version: number = 0;

}

export async function versionUpdate(remult: Remult) {
    // let remult = new Remult(db);
    // var schemaBuilder = new PostgresSchemaBuilder(db);
    // await schemaBuilder.verifyStructureOfAllEntities(remult);
    // await schemaBuilder.createIfNotExist(remult.repo(VersionInfo).metadata);
    let version = async (ver: number, what: () => Promise<void>) => {
        let v = await remult.repo(VersionInfo).findFirst();
        if (!v) {
            v = remult.repo(VersionInfo).create();
            v.version = 0;
        }
        if (v.version <= ver - 1) {
            console.log("Performing version update: ", ver);
            await what();
            v.version = ver;
            await v.save();
            console.log("Completed version update: ", ver);
        }
    };
    remult.setUser({
        id: 'startup',
        name: "startup",
        roles: [Roles.admin]
    })


    version(1, async () => {
        for (const group of await remult.repo(Group).find()) {
            group.groupType = group.isBand ? GroupType.band60 : GroupType.oneOnOne;
            await group.save();
        }
    });
    version(2, async () => {
        for (const user of await remult.repo(User).find()) {
            if (user.priceBand > 0) {
                await remult.repo(TeacherRate).insert({ teacherId: user.id, groupType: GroupType.band60, price: user.priceBand });
            }
        }
    });
}



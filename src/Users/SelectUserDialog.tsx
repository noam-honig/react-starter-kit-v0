import { Fragment, useContext, useState } from "react";
import { RemultContext } from "../common";
import { uiTools } from "../Utils/FormDialog";
import { openDialog } from "../Utils/StackUtils";
import { useEntityQuery } from "../Utils/useEntityQuery";
import { User } from "./User.entity";

export interface SelectUserArgs {
    select: (user: User) => void;
}
export function SelectUser(props: SelectUserArgs) {
    
    return openDialog(close => {
        const SelectStudentElement = () => {
            const remult = useContext(RemultContext);
            const [search, setSearch] = useState('');
            const { data } = useEntityQuery(async () => remult.repo(User).find({
                where: {
                    name: { $contains: search }
                }
            }), [search]);
            const select = (s: User) => {
                props.select(s); close();
            }
            return (
                <>
                    <input value={search} onChange={e => setSearch(e.target.value)} />
                    <ul>{data?.map(s => (<li key={s.id} onClick={() => select(s)}>{s.name}</li>))}
                    </ul>
                    <button onClick={() => close()}>סגור</button>

                </>)
        }
        return (<SelectStudentElement />);
    });
}
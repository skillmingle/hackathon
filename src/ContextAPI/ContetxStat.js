import React, { useState } from "react";
import ContextApi from "./ContextApi"

const ContextStat = (props)=>{

    const ud= localStorage.getItem("userData")
    const userData= JSON.parse(ud)

    const [user, setuser] = useState(userData);

    return(
        <ContextApi.Provider value={{user, setuser}}>
            {props.children}
        </ContextApi.Provider>
    )
}

export default ContextStat
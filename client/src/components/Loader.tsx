import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

const Loader = () => {
  return (
    <main className='w-full flex justify-center mt-40'>
      <FontAwesomeIcon
        icon={faCircleNotch}
        className='animate-spin size-7 w-full text-gray-600 p-0 m-0'
      />
    </main>
  );
};

export default Loader;

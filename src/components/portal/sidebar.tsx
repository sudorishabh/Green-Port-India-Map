import { PortalNav } from "./nav";

/** Section links beside the page on large screens; the header has them otherwise. */
const Sidebar = () => (
  <aside className='hidden w-60 shrink-0 border-r bg-background lg:block'>
    <div className='sticky top-14'>
      <PortalNav variant='sidebar' />
    </div>
  </aside>
);

export default Sidebar;

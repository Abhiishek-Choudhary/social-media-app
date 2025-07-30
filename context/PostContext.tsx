'use client';

import { createContext, useContext, useState } from 'react';

const PostContext = createContext({
  trigger: 0,
  refresh: () => {},
});

export const usePostContext = () => useContext(PostContext);

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const [trigger, setTrigger] = useState(0);

  const refresh = () => setTrigger(prev => prev + 1);

  return (
    <PostContext.Provider value={{ trigger, refresh }}>
      {children}
    </PostContext.Provider>
  );
};

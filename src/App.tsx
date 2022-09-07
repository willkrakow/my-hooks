import React, { createRef, useRef } from 'react';
import useDataSync from './hooks/useDataSync'
import DataContextProvider from './providers/DataContext';
import Todos, { TTodo } from './services/todos';

const isDate = (item: null | undefined | Date): item is Date => {
  return typeof item !== 'undefined' && item !== null;
}
function App() {
  const { data, loading, sendData, deleteData, updateData } = useDataSync({
    getter: Todos.getAll,
    creator: Todos.create,
    updater: Todos.update,
    deleter: Todos.remove,
    fetchOnLoad: true,
    optimistic: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: titleRef.current?.value || '',
      text: textRef.current?.value || '',
      completed: false,
    }
    sendData(data)
  }

  const handleToggleComplete = (item: TTodo) => {
    updateData({
      id: item.id,
      completed: !item.completed,
    })
  }

  const handleDelete = (item: TTodo) => {
    deleteData({id: item.id});
  }

  const titleRef = createRef<HTMLInputElement>();
  const textRef = createRef<HTMLInputElement>();

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <input ref={titleRef} name="title" placeholder='Title' />
        <input ref={textRef} name="text" placeholder='Text' />
        <button type="submit">+ Add</button>
      </form>
      {data && data.length > 0 && data.filter(item => !item?.deleted_at).map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          <button onClick={() => handleToggleComplete(item)}>{item.completed ? "Undo" : "Mark done"}</button>
          <button onClick={() => handleDelete(item)}>Delete</button>
        </div>
      ))}
    </section>
  )
}

export default App

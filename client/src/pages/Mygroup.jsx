import "./MyGroup.css";

function MyGroup() {
  return (
    <div className="mygroup-root">
      <div className="mygroup-header">
        <h1>My Group</h1>
        <p>Collaborate and learn with your peers</p>
      </div>
      <div className="mygroup-content">
        <div className="mygroup-card">
          <span>👥</span>
          <h2>Group features coming soon</h2>
          <p>Chat, tasks, and shared goals will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default MyGroup;
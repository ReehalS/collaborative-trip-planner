'use client';

import { useEffect, useState } from 'react';
import { Activity } from '../_types';
import { jwtDecode } from "jwt-decode";
import { User } from '../_types'

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Simulate API call to fetch activities
    const token = localStorage.getItem('token')
    const user = jwtDecode<{ exp: number } & User>(token);
    const userId = user.id
    fetch(`/api/activities?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setActivities(data.activities || []));
  }, []);

  if (!activities.length) {
    return <p>No activities found.</p>;
  }

  return (
    <div>
      <h1>Your Activities</h1>
      {activities.map((activity) => (
        <div key={activity.id} style={{ margin: '1rem 0' }}>
          <h2>{activity.activityName}</h2>
          {activity.notes ? <p>{activity.notes}</p> : <></>}
        </div>
      ))}
    </div>
  );
};

export default ActivitiesPage;

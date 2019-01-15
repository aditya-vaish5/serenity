import React, { Component } from 'react';
import SearchCourses from './SearchCourses';
import Timetable from './Timetable';
import readttbookletserver from '../readTimetable';
import timetabledata from './timetabledata';

class App extends Component {

    state = {
        coursePool: [...readttbookletserver(timetabledata)]
    }

    render() {
        return (
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <SearchCourses coursePool={this.state.coursePool}/>
                <Timetable />
            </div>
        );
    }
}

export default App;
"use strict"

// --------------------VARIABLES AND CLASSES--------------------

var tt = [
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null]
];

let creditsInCart = 0;

let coursesToRead = [""];

function isNullOrWhiteSpace(str) {
    return (!str || str.length === 0 || /^\s*$/.test(str));
}

let fileInput = document.querySelector("#fileInput");
//let fileInput = document.getElementById("fileInput");

let coursePool = [];

let courseCart = [];

let compulsoryCourses = [];

let humanitiesElectives = [];

let daysDictionary = {
    M: 0,
    T: 1,
    W: 2,
    Th: 3,
    F: 4,
    S: 5,
};

let daysDictionaryReverse = {
    0: "M",
    1: "T",
    2: "W",
    3: "Th",
    4: "F",
    5: "S",
}

class Course {
    constructor() {
        this.comCode = null;
        this.courseNo = null;
        this.courseTitle = null;
        this.credits = [];
        this.ic = null;
        this.lectureSections = [];
        this.tutorialSections = [];
        this.practicalSections = [];
        this.compreDate = null;
    }
}

class Section {
    constructor () {
        this.commonHour = null;
        this.type = null;
        this.sectionNo = null;
        this.instructors = [];
        this.roomNo = null;
        this.days = [];
        this.hours = [];
    }
}

class Instructor {
    constructor(instructor, department) {
        this.instructor = instructor;
        this.department = department;
    }
}

class CartItem {
    constructor(course) {
        this.course = course;
        this.lectureSection = null;
        this.tutorialSection = null;
        this.practicalSection = null;
    }
}

// --------------------FUNCTIONS--------------------



function refreshAll() {
    refreshCredits();
    refreshCart();
    refreshCatalog();
}

function refreshCredits(){
    let credits = 0;
    for (let i in courseCart) {
        let course = courseCart[i].course;
        credits += course.credits[2];
    }
    creditsInCart = credits;
    document.getElementById("credits-label").innerHTML = "Credits: " + creditsInCart;
}

function removeCartItem (cartItem) {
    let course = cartItem.course;
    if (cartItem.lectureSection) {
        for (let i in course.lectureSections) {
            let section = course.lectureSections[i];
            if (section.sectionNo == cartItem.lectureSection) {
                removeSection(course, section);
            }
        }
    }
    if (cartItem.practicalSection) {
        for (let i in course.practicalSections) {
            let section = course.practicalSections[i];
            if (section.sectionNo == cartItem.practicalSection) {
                removeSection(course, section);
            }
        }
    }
    if (cartItem.tutorialSection) {
        for (let i in course.tutorialSections) {
            let section = course.tutorialSections[i];
            if (section.sectionNo == cartItem.tutorialSection) {
                removeSection(course, section);
            }
        }
    }

    let courseNotEquals = function (el) {
        return !(el.course.courseNo == course.courseNo);
    }

    // let cartPanel = document.getElementById("control-panel");
    // for (let i in cartPanel.childNodes) {
    //     if (cartPanel.childNodes[i].course.courseNo == course.courseNo) {
    //         cartPanel.removeChild(cartPanel.childNodes[i]);
    //     }
    // }

    courseCart = courseCart.filter(courseNotEquals);
}

function addCartItem (course) {
    let courseItem = new CartItem (course);

    if (course.lectureSections.length == 1) {
        courseItem.lectureSection = 1;
    }
    if (course.practicalSections.length == 1) {
        courseItem.practicalSection = 1;
    }
    if (course.tutorialSections.length == 1) {
        courseItem.tutorialSection = 1;
    }

    courseCart.push(courseItem);

    //Add course in GUI
    let itemObject = document.createElement("div");
    itemObject.setAttribute("class", "cart-item");
    itemObject.setAttribute("id", course.courseNo);

    let courseLabel = document.createElement("label");
    courseLabel.innerHTML = course.courseNo + ": " + course.courseTitle;
    itemObject.appendChild(courseLabel);

    let lineBreak = document.createElement("br");
    itemObject.appendChild(lineBreak);

    let lectureLabel = document.createElement("label");
    lectureLabel.innerHTML = "Lecture: ";
    itemObject.appendChild(lectureLabel);

    let lectureSelector = document.createElement("select");
    let selectedIndex = 0;
    let emptyOption = document.createElement("option");
    emptyOption.value = "";
    lectureSelector.add(emptyOption);

    for (let i in course.lectureSections) {
        let section = course.lectureSections[i];
        if ( !checkClash(course, section) ) {
            let sectionOption = document.createElement("option");
            sectionOption.value = section.sectionNo.toString();
            if (courseItem.lectureSection == section.sectionNo) {
                selectedIndex = lectureSelector.length;
                addSection(course, section);
            }
            let sectionOptionString = "";
            sectionOptionString += section.sectionNo.toString() + ". ";
            for (let j in section.days) {
                sectionOptionString += daysDictionaryReverse[section.days[j]] + " ";
            }
            for (let j in section.hours) {
                sectionOptionString += section.hours[j].toString() + " ";
            }
            sectionOption.innerHTML = sectionOptionString;
            lectureSelector.add(sectionOption);
        }
    }
    lectureSelector.selectedIndex = selectedIndex;
    if (course.lectureSections.length == 1) {
        lectureSelector.disabled = true;
    }
    let handleSelector = function() {
        let section = null;
        if (courseItem.lectureSection) {
            for (let i in course.lectureSections) {
                section = course.lectureSections[i];
                if (section.sectionNo == courseItem.lectureSection) {
                    removeSection(course, section);
                    courseItem.lectureSection = null;
                }
            }
        }
        if (lectureSelector.value != "") {
            for (let i in course.lectureSections) {
                section = course.lectureSections[i];
                if (section.sectionNo.toString() == lectureSelector.value) {
                    addSection(course, section);
                    courseItem.lectureSection = section.sectionNo;
                }
            }
        }
        refreshAll();
    }
    lectureSelector.setAttribute("class", "lectureSelector");
    lectureSelector.addEventListener('change', handleSelector);
    itemObject.appendChild(lectureSelector);

    if (course.practicalSections.length != 0) {
        let lineBreak = document.createElement("br");
        itemObject.appendChild(lineBreak);

        let practicalLabel = document.createElement("label");
        practicalLabel.innerHTML = "Practical: ";
        itemObject.appendChild(practicalLabel);

        let practicalSelector = document.createElement("select");
        let emptyOption = document.createElement("option");
        emptyOption.value = "";
        practicalSelector.add(emptyOption);

        let selectedIndex = 0;

        for (let i in course.practicalSections) {
            let section = course.practicalSections[i];
            if ( !checkClash(course, section) ) {
                let sectionOption = document.createElement("option");
                sectionOption.value = section.sectionNo.toString();
                if (courseItem.practicalSection == section.sectionNo) {
                    selectedIndex = practicalSelector.length;
                    addSection(course, section);
                }
                let sectionOptionString = "";
                sectionOptionString += section.sectionNo.toString() + ". ";
                for (let j in section.days) {
                    sectionOptionString += daysDictionaryReverse[section.days[j]] + " ";
                }
                for (let j in section.hours) {
                    sectionOptionString += section.hours[j].toString() + " ";
                }
                sectionOption.innerHTML = sectionOptionString;
                practicalSelector.add(sectionOption);
            }
        }
        practicalSelector.selectedIndex = selectedIndex;
        if (course.practicalSections.length == 1) {
            practicalSelector.disabled = true;
        }
        let handleSelector = function() {
            let section = null;
            if (courseItem.practicalSection) {
                for (let i in course.practicalSections) {
                    section = course.practicalSections[i];
                    if (section.sectionNo == courseItem.practicalSection) {
                        removeSection(course, section);
                        courseItem.practicalSection = null;
                    }
                }
            }
            if (practicalSelector.value != "") {
                for (let i in course.practicalSections) {
                    section = course.practicalSections[i];
                    if (section.sectionNo.toString() == practicalSelector.value) {
                        addSection(course, section);
                        courseItem.practicalSection = section.sectionNo;
                    }
                }
            }
            refreshAll();
        }
        practicalSelector.setAttribute("class", "practicalSelector");
        practicalSelector.addEventListener('change', handleSelector);
        itemObject.appendChild(practicalSelector);
    }

    if (course.tutorialSections.length != 0) {
        let lineBreak = document.createElement("br");
        itemObject.appendChild(lineBreak);

        let tutorialLabel = document.createElement("label");
        tutorialLabel.innerHTML = "Tutorial: ";
        itemObject.appendChild(tutorialLabel);

        let tutorialSelector = document.createElement("select");
        let emptyOption = document.createElement("option");
        emptyOption.value = "";
        tutorialSelector.add(emptyOption);

        let selectedIndex = 0;

        for (let i in course.tutorialSections) {
            let section = course.tutorialSections[i];
            if ( !checkClash(course, section) ) {
                let sectionOption = document.createElement("option");
                sectionOption.value = section.sectionNo.toString();
                if (courseItem.tutorialSection == section.sectionNo) {
                    selectedIndex = tutorialSelector.length;
                    addSection(course, section);
                }
                let sectionOptionString = "";
                sectionOptionString += section.sectionNo.toString() + ". ";
                for (let j in section.days) {
                    sectionOptionString += daysDictionaryReverse[section.days[j]] + " ";
                }
                for (let j in section.hours) {
                    sectionOptionString += section.hours[j].toString() + " ";
                }
                sectionOption.innerHTML = sectionOptionString;
                tutorialSelector.add(sectionOption);               
            }
        }
        tutorialSelector.selectedIndex = selectedIndex;
        if (course.tutorialSections.length == 1) {
            tutorialSelector.disabled = true;
        }
        let handleSelector = function() {
            let section = null;
            if (courseItem.tutorialSection) {
                for (let i in course.tutorialSections) {
                    section = course.tutorialSections[i];
                    if (section.sectionNo == courseItem.tutorialSection) {
                        removeSection(course, section);
                        courseItem.tutorialSection = null;
                    }
                }
            }
            if (tutorialSelector.value != "") {
                for (let i in course.tutorialSections) {
                    section = course.tutorialSections[i];
                    if (section.sectionNo.toString() == tutorialSelector.value) {
                        addSection(course, section);
                        courseItem.tutorialSection = section.sectionNo;
                    }
                }
            }
            refreshAll();
        }
        tutorialSelector.setAttribute("class", "tutorialSelector");
        tutorialSelector.addEventListener('change', handleSelector);
        itemObject.appendChild(tutorialSelector);

    }

    let removeBtn = document.createElement("button");
    removeBtn.innerHTML = "REMOVE";
    let handleRemoveBtn = function() {
        removeCartItem(courseItem);
        document.getElementById("control-panel").removeChild(document.getElementById(course.courseNo));
        refreshAll();
    };
    removeBtn.onclick = handleRemoveBtn;
    lineBreak = document.createElement("br");
    itemObject.appendChild(lineBreak);
    itemObject.appendChild(removeBtn);
    document.getElementById("control-panel").appendChild(itemObject);
}

function refreshCart() {
    let cartPanel = document.getElementById("control-panel");

    for (let i in cartPanel.childNodes) {
        let itemObject = cartPanel.childNodes[i];
        let courseItem = null;
        for (let j in courseCart) {
            if (courseCart[j].course.courseNo == itemObject.id) {
                courseItem = courseCart[j];
            }
        }

        //Repopulate section options
        let lectureSelector = null;
        let practicalSelector = null;
        let tutorialSelector = null;

        for (let j in itemObject.childNodes) {
            let nodeClass = itemObject.childNodes[j].className;
            if (nodeClass == "lectureSelector") {
                lectureSelector = itemObject.childNodes[j];
            }
            if (nodeClass == "practicalSelector") {
                practicalSelector = itemObject.childNodes[j];
            }
            if (nodeClass == "tutorialSelector") {
                tutorialSelector = itemObject.childNodes[j];
            }
        }

        let selectedIndex = 0;

        let selector = lectureSelector;

        if (selector) {
            while (selector.length > 1) {
                selector.remove(1);
            }
            for (let j in courseItem.course.lectureSections) {
                let section = courseItem.course.lectureSections[j];
                if (!checkClash(courseItem.course, section)) {
                    let sectionOption = document.createElement("option");
                    sectionOption.value = section.sectionNo.toString();
                    if (courseItem.lectureSection == section.sectionNo) {
                        selectedIndex = lectureSelector.length;
                    }
                    let sectionOptionString = "";
                    sectionOptionString += section.sectionNo.toString() + ". ";
                    for (let j in section.days) {
                        sectionOptionString += daysDictionaryReverse[section.days[j]] + " ";
                    }
                    for (let j in section.hours) {
                        sectionOptionString += section.hours[j].toString() + " ";
                    }
                    sectionOption.innerHTML = sectionOptionString;
                    lectureSelector.add(sectionOption);
                    if (courseItem.course.lectureSections.length == 1) {
                        selectedIndex = 1;
                        lectureSelector.disabled = true;
                    }
                }
            }
            lectureSelector.selectedIndex = selectedIndex;
        }

        selectedIndex = 0;

        selector = practicalSelector;

        if (selector) {
            while (selector.length > 1) {
                selector.remove(1);
            }
            for (let j in courseItem.course.practicalSections) {
                let section = courseItem.course.practicalSections[j];
                if (!checkClash(courseItem.course, section)) {
                    let sectionOption = document.createElement("option");
                    sectionOption.value = section.sectionNo.toString();
                    if (courseItem.practicalSection == section.sectionNo) {
                        selectedIndex = practicalSelector.length;
                    }
                    let sectionOptionString = "";
                    sectionOptionString += section.sectionNo.toString() + ". ";
                    for (let j in section.days) {
                        sectionOptionString += daysDictionaryReverse[section.days[j]] + " ";
                    }
                    for (let j in section.hours) {
                        sectionOptionString += section.hours[j].toString() + " ";
                    }
                    sectionOption.innerHTML = sectionOptionString;
                    practicalSelector.add(sectionOption);
                    if (courseItem.course.practicalSections.length == 1) {
                        selectedIndex = 1;
                        practicalSelector.disabled = true;
                    }
                }
            }
            practicalSelector.selectedIndex = selectedIndex;
        }

        selectedIndex = 0;

        selector = tutorialSelector;

        if (selector) {
            while (selector.length > 1) {
                selector.remove(1);
            }
            for (let j in courseItem.course.tutorialSections) {
                let section = courseItem.course.tutorialSections[j];
                if (!checkClash(courseItem.course, section)) {
                    let sectionOption = document.createElement("option");
                    sectionOption.value = section.sectionNo.toString();
                    if (courseItem.tutorialSection == section.sectionNo) {
                        selectedIndex = tutorialSelector.length;
                    }
                    let sectionOptionString = "";
                    sectionOptionString += section.sectionNo.toString() + ". ";
                    for (let j in section.days) {
                        sectionOptionString += daysDictionaryReverse[section.days[j]] + " ";
                    }
                    for (let j in section.hours) {
                        sectionOptionString += section.hours[j].toString() + " ";
                    }
                    sectionOption.innerHTML = sectionOptionString;
                    tutorialSelector.add(sectionOption);
                    if (courseItem.course.tutorialSections.length == 1) {
                        selectedIndex = 1;
                        tutorialSelector.disabled = true;
                    }
                }
            }
            tutorialSelector.selectedIndex = selectedIndex;
        }
        
    }
}


function checkClash(course, section){
    var clashExists = false;
    if (section.commonHour) {
        let day = section.commonHour.day;
        let hour = section.commonHour.hour - 1;
        if ( tt[hour][day] ) {
            if ( !(tt[hour][day].course.courseNo==course.courseNo && tt[hour][day].section.type==section.type) ) {
                clashExists = true;
            }
        }
    }
    for (let i in section.days) {
        for (let j in section.hours) {
            let day = section.days[i];
            let hour = section.hours[j] - 1;
            if ( tt[hour][day] ) {
                if ( !(tt[hour][day].course.courseNo==course.courseNo && tt[hour][day].section.type==section.type) ) {
                    clashExists = true;
                }
            }
        }
    }
    return clashExists;
}

function addSection(course, section) {
    if (section.commonHour) {
        let day = section.commonHour.day;
        let hour = section.commonHour.hour - 1;
        tt[hour][day] = {course, section};

        document.getElementById(hour.toString() + day.toString()).innerHTML = stringCommonHour(course, section);
    }
    for (let i in section.days) {
        for (let j in section.hours) {
            let day = section.days[i];
            let hour = section.hours[j] - 1;
            tt[hour][day] = {course, section};
            document.getElementById(hour.toString() + day.toString()).innerHTML = stringSection(course, section);
        }
    }
    // refreshDisplay();
}

function removeSection(course, section) {
    if (section.commonHour) {
        let day = section.commonHour.day;
        let hour = section.commonHour.hour - 1;
        tt[hour][day] = null;
        let node = document.getElementById(hour.toString() + day.toString());
        while (node.childNodes.length > 0) {
            node.removeChild(node.childNodes[0]);
        }
    }
    for (let i in section.days) {
        for (let j in section.hours) {
            let day = section.days[i];
            let hour = section.hours[j] - 1;
            tt[hour][day] = null;
            let node = document.getElementById(hour.toString() + day.toString());
            while (node.childNodes.length > 0) {
                node.removeChild(node.childNodes[0]);
            }
        }
    }
    // refreshDisplay();
}

function courseClash(course) {
    let clash = false;
    if (course.lectureSections[0].commonHour) {
        clash = checkClash(course, course.lectureSections[0]);
    }
    let allLecturesClash = Boolean(course.lectureSections.length);
    let allTutorialsClash = Boolean(course.tutorialSections.length);
    let allPracticalsClash = Boolean(course.practicalSections.length);
    for (let i in course.lectureSections) {
        if (!checkClash(course, course.lectureSections[i])) {
            allLecturesClash = false;
            break;
        }
    }
    for (let i in course.practicalSections) {
        if (!checkClash(course, course.practicalSections[i])) {
            allPracticalsClash = false;
            break;
        }
    }
    for (let i in course.tutorialSections) {
        if (!checkClash(course, course.tutorialSections[i])) {
            allTutorialsClash = false;
            break;
        }
    }
    let compreClashes = false;
    let creditsExceed = false;
    let cartCredits = 0;
    for (let i in courseCart) {
        let courseItem = courseCart[i];
        cartCredits += courseItem.course.credits[2];
        if ( (courseItem.course.compreDate.date.getTime() == course.compreDate.date.getTime()) && (courseItem.course.compreDate.time == course.compreDate.time) ) {
            compreClashes = true;
        }
        if ( (cartCredits + course.credits[2]) > 25 ) {
            creditsExceed = true;
        }
    }
    clash = clash || allLecturesClash || allTutorialsClash || allPracticalsClash || compreClashes || creditsExceed;
    return clash;
}

function stringSection(course, section) {
    return course.courseNo + "\n" + course.courseTitle + "\n" + section.type + "\nSection: " + section.sectionNo;
}

function stringCommonHour(course, section) {
    return course.courseNo + "\n" + course.courseTitle + "\nCommon Hour\nSection: " + section.sectionNo;
}

function refreshCatalog() {
    let catalog = document.getElementById("configuration-panel");
    while (catalog.childNodes.length > 0) {
        catalog.removeChild(catalog.childNodes[0]);
    }
    outer:
    for (let i in coursePool) {
        let course = coursePool[i];
        for (let j in courseCart) {
            if (course.courseNo == courseCart[j].course.courseNo) {
                continue outer;
            }
        }
        if (!courseClash(course) && courseMatchesSearch(course)) {
            //add course to catalog
            let catalogItem = document.createElement("div");
            catalogItem.setAttribute("class", "catalog-item");

            let courseLabel = document.createElement("label");
            courseLabel.innerHTML = course.courseNo + ": " + course.courseTitle;
            catalogItem.appendChild(courseLabel);

            let lineBreak = document.createElement("br");
            catalogItem.appendChild(lineBreak);
            
            let addBtn = document.createElement("button");
            let addCourseToCart = function() {
                addCartItem(course);
                refreshAll();
            }
            addBtn.onclick = addCourseToCart;
            addBtn.innerHTML = "ADD";
            catalogItem.appendChild(addBtn);

            catalog.appendChild(catalogItem);
        }
    }
}

function courseMatchesSearch(course) {
    let courseMatches = false;
    let searchKeyword = document.getElementById("search-bar").value;
    searchKeyword = searchKeyword.toUpperCase();
    if ( (searchKeyword == "") || (course.courseNo.startsWith(searchKeyword)) ) {
        courseMatches = true;
    }
    return courseMatches;
}

function readttbooklet(file) {
    let reader = new FileReader();
    reader.onload = function () {
        let rawText = reader.result;
        let splitText = rawText.split(/,|\n/);

        for (let i=0 ; i < splitText.length ; ) {
            //ADD FILTRATION CLAUSE HERE
            let skipCourse = true;
            for (let j in coursesToRead) {
                let coursePrefix = coursesToRead[j];
                if (splitText[i+1].startsWith(coursePrefix)) {
                    skipCourse = false;
                }
            }
            // if ( !splitText[i+1].startsWith("CS F2") &&!splitText[i+1].startsWith("GS") && !splitText[i+1].startsWith("HSS") ) {
            if (skipCourse) {
                console.log("Skipping course: " + splitText[i+1]);
                do {
                    i += 12;
                } while ( isNullOrWhiteSpace(splitText[i]) && i<splitText.length );
                continue;
            }

            let j=i;

            //Read Course Details
            let newCourse = new Course();
            newCourse.comCode = parseInt(splitText[j], 10);
            newCourse.courseNo = splitText[j+1];
            newCourse.courseTitle = splitText[j+2];
            let individualCredits = splitText[j+3].split(' ');
            individualCredits = individualCredits.filter(Boolean);
            for (let k=0 ; k<3 ; k++) {
                newCourse.credits.push( parseInt(individualCredits[k], 10) );
            }
            newCourse.compreDate = splitText[j+11];
            let compreDateList = splitText[j+11].split(" ");
            compreDateList = compreDateList.filter(Boolean);
            compreDateList[0] = compreDateList[0].split("/");
            newCourse.compreDate = {
                date: new Date(2019, parseInt(compreDateList[0][1]) - 1, parseInt(compreDateList[0][0])),
                time: compreDateList[1],
            }

            //Read Lecture Sections
            do {
                let newSection = new Section();

                if (splitText[j+10]) {
                    let commonHourList = splitText[j+10].split(' ');
                    commonHourList = commonHourList.filter(Boolean);
                    newSection.commonHour = {
                        // day: commonHourList[0],
                        day: daysDictionary[commonHourList[0]],
                        // hour: commonHourList[1],
                        hour: parseInt(commonHourList[1]),
                        // room: commonHourList[2],
                        room: parseInt(commonHourList[2]),
                    };
                }

                newSection.type = "Lecture";
                newSection.sectionNo = parseInt(splitText[j+4]);
                newSection.roomNo = parseInt(splitText[j+7]);

                let daysList = splitText[j+8].split(' ');
                daysList = daysList.filter(Boolean);
                for (let day in daysList) {
                    // if (day) {
                        newSection.days.push(daysDictionary[daysList[day]]);
                    // }
                }

                let hoursList = splitText[j+9].split(' ');
                hoursList = hoursList.filter(Boolean);
                for (let hour in hoursList) {
                    // if (hour) {
                        newSection.hours.push( parseInt(hoursList[hour]) );
                    // }
                }
                do {
                    let newInstructor = new Instructor( splitText[j+5], splitText[j+6] );
                    newSection.instructors.push(newInstructor);
                    j += 12;
                } while ( isNullOrWhiteSpace(splitText[j]) && isNullOrWhiteSpace(splitText[j+2]) && isNullOrWhiteSpace(splitText[j+4]) && (j < splitText.length) );
                newCourse.lectureSections.push(newSection);
            } while ( isNullOrWhiteSpace(splitText[j]) && isNullOrWhiteSpace(splitText[j+2]) && (j < splitText.length) );

            //Read Practical Sections
            if ( isNullOrWhiteSpace(splitText[j]) && (splitText[j+2] == 'Practical') ) {
                do {
                    let newSection = new Section();

                    newSection.type = "Practical";
                    newSection.sectionNo = parseInt(splitText[j+4]);
                    newSection.roomNo = parseInt(splitText[j+7]);

                    let daysList = splitText[j+8].split(' ');
                    daysList = daysList.filter(Boolean);
                    for (let day in daysList) {
                        // if (day) {
                            newSection.days.push(daysDictionary[daysList[day]]);
                        // }
                    }

                    let hoursList = splitText[j+9].split(' ');
                    hoursList = hoursList.filter(Boolean);
                    for (let hour in hoursList) {
                        // if (hour) {
                            newSection.hours.push( parseInt(hoursList[hour]) );
                        // }
                    }
                    do {
                        let newInstructor = new Instructor( splitText[j+5], splitText[j+6] );
                        newSection.instructors.push(newInstructor);
                        j += 12;
                    } while ( isNullOrWhiteSpace(splitText[j]) && isNullOrWhiteSpace(splitText[j+2]) && isNullOrWhiteSpace(splitText[j+4]) && (j < splitText.length) );
                    newCourse.practicalSections.push(newSection);
                } while ( isNullOrWhiteSpace(splitText[j]) && isNullOrWhiteSpace(splitText[j+2]) && (j < splitText.length) );
            }

            //Read Tutorial Sections
            if ( isNullOrWhiteSpace(splitText[j]) && (splitText[j+2] == 'Tutorial') ) {
                do {
                    let newSection = new Section();

                    newSection.type = "Tutorial";
                    newSection.sectionNo = parseInt(splitText[j+4]);
                    newSection.roomNo = parseInt(splitText[j+7]);

                    let daysList = splitText[j+8].split(' ');
                    daysList = daysList.filter(Boolean);
                    for (let day in daysList) {
                        // if (day) {
                            newSection.days.push(daysDictionary[daysList[day]]);
                        // }
                    }

                    let hoursList = splitText[j+9].split(' ');
                    hoursList = hoursList.filter(Boolean);
                    for (let hour in hoursList) {
                        // if (hour) {
                            newSection.hours.push( parseInt(hoursList[hour]) );
                        // }
                    }
                    do {
                        let newInstructor = new Instructor( splitText[j+5], splitText[j+6] );
                        newSection.instructors.push(newInstructor);
                        j += 12;
                    } while ( isNullOrWhiteSpace(splitText[j]) && isNullOrWhiteSpace(splitText[j+2]) && isNullOrWhiteSpace(splitText[j+4]) && (j < splitText.length) );
                    newCourse.tutorialSections.push(newSection);
                } while ( isNullOrWhiteSpace(splitText[j]) && isNullOrWhiteSpace(splitText[j+2]) && (j < splitText.length) );
            }

            i=j;

            //INSERT FILTER CONDITION HERE
            // if (!newCourse.courseNo.startsWith("CS")) {
            //     delete newCourse;
            // }
            coursePool.push(newCourse);
            console.log("Read course: " + newCourse.courseNo);
        }

        //ACTION TO TAKE AFTER TT IS READ
        document.getElementById("search-bar").addEventListener('keyup', refreshAll);
        refreshAll();

    };
    reader.readAsBinaryString(fileInput.files[0]);
}

fileInput.addEventListener('change', readttbooklet);

//refreshAll();













// --------------------WASTEBASKET--------------------

// function refreshDisplay() {
//     for (let i=0 ; i<6 ; i++) {
//         for (let j=0 ; j<12 ; j++) {
//             if (tt[j][i]) {
//                 course = t[j][i].course;
//                 section = t[j][i].section;
//                 if (section.commonHour.day === j && section.commonHour.hour == i) {
//                     document.getElementById(j.toString + i.toString).innerHTML = stringSection(course, section);
//                 }
//                 else {
//                     document.getElementById(j.toString + i.toString).innerHTML = stringCommonHour(course, section);
//                 }
//             }
//             else {
//                 document.getElementById(j.toString + i.toString).innerHTML = "";
//             }
//         }
//     }
// }

            // <div class="cart-item">
            //     <label>CS F111</label>
            //     <br>
            //     <label>Lecture: </label>
            //     <select name="Lecture Section" id="">
            //         <option value=""></option>
            //         <option value="1">1. M W F 8:30</option>
            //     </select>
            // </div>

// function refreshCart() {
//     let cart = document.getElementById("control-panel");

//     //Remove all elements from cart GUI
//     while(cart.firstChild) {
//         cart.removeChild(cart.firstChild);
//     }

//     //Create and add elements to cart GUI
//     for (let item in courseCart) {
//         let course = courseCart[item].course;

//         let itemObject = document.createElement("div");
//         itemObject.setAttribute("class", "cart-item");

//         let courseLabel = document.createElement("label");
//         courseLabel.innerHTML = course.courseNo + ": " + course.courseTitle;
//         itemObject.appendChild(courseLabel);

//         let lineBreak = document.createElement("br");
//         itemObject.appendChild(lineBreak);

//         let lectureLabel = document.createElement("label");
//         lectureLabel.innerHTML = "Lecture: ";
//         itemObject.appendChild(lectureLabel);

//         let lectureSelector = document.createElement("select");
//         let selectedIndex = 0;
//         let emptyOption = document.createElement("option");
//         emptyOption.value = "";
//         lectureSelector.add(emptyOption);

//         for (let i in course.lectureSections) {
//             let section = course.lectureSections[i];
//             if ( !checkClash(section) ) {
//                 let sectionOption = document.createElement("option");
//                 sectionOption.value = section.sectionNo.toString();
//                 if (courseCart[item].lectureSection == section.sectionNo) {
//                     selectedIndex = lectureSelector.length;
//                 }
//                 let sectionOptionString = "";
//                 sectionOptionString += section.sectionNo.toString() + ". ";
//                 for (let j in section.days) {
//                     sectionOptionString += daysDictionaryReverse[section.days[j]] + " ";
//                 }
//                 for (let j in section.hours) {
//                     sectionOptionString += section.hours[j].toString() + " ";
//                 }
//                 sectionOption.innerHTML = sectionOptionString;
//                 lectureSelector.selectedIndex = selectedIndex;
//                 lectureSelector.add(sectionOption);
//                 if (course.lectureSections.length == 1) {
//                     lectureSelector.disabled = true;
//                 }
//             }
//         }
//         itemObject.appendChild(lectureSelector);

//         if (course.practicalSections.length != 0) {
//             let lineBreak = document.createElement("br");
//             itemObject.appendChild(lineBreak);

//             let practicalLabel = document.createElement("label");
//             practicalLabel.innerHTML = "Practical: ";
//             itemObject.appendChild(practicalLabel);

//             let practicalSelector = document.createElement("select");
//             let emptyOption = document.createElement("option");
//             emptyOption.value = "";
//             practicalSelector.add(emptyOption);

//             let selectedIndex = 0;

//             for (let i in course.practicalSections) {
//                 let section = course.practicalSections[i];
//                 if ( !checkClash(section) ) {
//                     let sectionOption = document.createElement("option");
//                     sectionOption.value = section.sectionNo.toString();
//                     if (courseCart[item].practicalSection == section.sectionNo) {
//                         selectedIndex = practicalSelector.length;
//                     }
//                     let sectionOptionString = "";
//                     sectionOptionString += section.sectionNo.toString() + ". ";
//                     for (let j in section.days) {
//                         sectionOptionString += daysDictionaryReverse[section.days[j]] + " ";
//                     }
//                     for (let j in section.hours) {
//                         sectionOptionString += section.hours[j].toString() + " ";
//                     }
//                     sectionOption.innerHTML = sectionOptionString;
//                     practicalSelector.add(sectionOption);
//                 }
//             }
//             practicalSelector.selectedIndex = selectedIndex;
//             itemObject.appendChild(practicalSelector);
//             if (course.practicalSections.length == 1) {
//                 practicalSelector.disabled = true;
//             }
//         }

//         if (course.tutorialSections.length != 0) {
//             let lineBreak = document.createElement("br");
//             itemObject.appendChild(lineBreak);

//             let tutorialLabel = document.createElement("label");
//             tutorialLabel.innerHTML = "Tutorial: ";
//             itemObject.appendChild(tutorialLabel);

//             let tutorialSelector = document.createElement("select");
//             let emptyOption = document.createElement("option");
//             emptyOption.value = "";
//             tutorialSelector.add(emptyOption);

//             let selectedIndex = 0;

//             for (let i in course.tutorialSections) {
//                 let section = course.tutorialSections[i];
//                 if ( !checkClash(section) ) {
//                     let sectionOption = document.createElement("option");
//                     sectionOption.value = section.sectionNo.toString();
//                     if (courseCart[item].tutorialSection == section.sectionNo) {
//                         selectedIndex = tutorialSelector.length;
//                     }
//                     let sectionOptionString = "";
//                     sectionOptionString += section.sectionNo.toString() + ". ";
//                     for (let j in section.days) {
//                         sectionOptionString += daysDictionaryReverse[section.days[j]] + " ";
//                     }
//                     for (let j in section.hours) {
//                         sectionOptionString += section.hours[j].toString() + " ";
//                     }
//                     sectionOption.innerHTML = sectionOptionString;

//                     tutorialSelector.selectedIndex = selectedIndex;
//                     tutorialSelector.addChild(sectionOption);

//                     if (course.tutorialSections.length == 1) {
//                         tutorialSelector.disabled = true;
//                     }
//                 }
//             }
//             itemObject.appendChild(tutorialSelector);

//         }
//         cart.appendChild(itemObject);
//     }
// }
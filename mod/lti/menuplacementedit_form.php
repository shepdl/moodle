<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * This page allows instructors to configure course level tool providers.
 *
 * @package mod_lti
 * @copyright  Copyright (c) 2011 Moodlerooms Inc. (http://www.moodlerooms.com)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @author     Chris Scribner
 */

require_once('../../config.php');
// require_once($CFG->dirroot.'/mod/lti/edit_form.php');
require_once($CFG->dirroot.'/mod/lti/lib.php');
require_once($CFG->libdir.'/formslib.php');
require_once($CFG->dirroot.'/mod/lti/locallib.php');


$courseid = required_param('course', PARAM_INT);

$action = required_param('action', PARAM_ALPHANUMEXT);

require_login($courseid, false);
$url = new moodle_url('/mod/lti/menuplacementedit_form.php');
$url->param('course', $courseid);

$PAGE->set_url($url);
// $PAGE->set_pagelayout('popup');
$PAGE->set_title(get_string('edittype', 'mod_lti'));

require_capability('mod/lti:addcoursetool', context_course::instance($courseid));

$alltypes = lti_load_course_menu_links($courseid);

class mod_lti_menuplacementedit_form extends moodleform {
    
    protected function definition() {
        $mform = $this->_form;
        
        $selectedtypesforcourse = $this->_customdata;
        
        foreach ($selectedtypesforcourse as $type) {
            $checkbox = $mform->addElement('checkbox', 'include-' . $type->id, $type->name);
            $mform->setDefault('include-' . $type->id, $type->selected);
        }
        
        $this->add_action_buttons();
    }
    
}


if ($action == 'save') {
    $selectedtypesforcourse = lti_load_course_menu_links($courseid);
    $form = new mod_lti_menuplacementedit_form($url, $selectedtypesforcourse);
    lti_set_course_menu_links($courseid, (array)$form->get_data());
}

$selectedtypesforcourse = lti_load_course_menu_links($courseid);
$url->param('action', 'save');
$form = new mod_lti_menuplacementedit_form($url, $selectedtypesforcourse);

$PAGE->set_title(format_string($SITE->shortname) . ': ' . get_string('selectcourseapptitle', 'mod_lti'));

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('courseapps', 'mod_lti'));
echo get_string('courseappselectionmessage', 'mod_lti');
echo $OUTPUT->box_start('generalbox');

if ($action == 'set' || $action == 'save') {
    $form->display();
}

echo $OUTPUT->box_end();
echo $OUTPUT->footer();
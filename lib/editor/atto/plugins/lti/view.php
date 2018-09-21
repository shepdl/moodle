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
//

/**
 * This file launches LTI-enabled tools that do not have a course module.
 *
 * If a tool instance is added to the rich text editor, it should not also show
 * up in the list of course activities. This file passes through the
 * resource_link_id without checking the database for it.
 *
 * @package    atto_lti
 * @copyright  2018 The Regents of the University of California
 * @author     David Shepard
 * @license    Not figured out
 */

require_once('../../../../../config.php');
require_once($CFG->dirroot.'/mod/lti/lib.php');
require_once($CFG->dirroot.'/mod/lti/locallib.php');

$courseid  = required_param('course', PARAM_INT);
$resourcelinkid = required_param('resourcelinkid', PARAM_ALPHANUMEXT);
$ltitypeid = required_param('ltitypeid', PARAM_INT);
$contenturl = optional_param('contenturl', '', PARAM_RAW);
$customdata = optional_param('custom', '', PARAM_RAW);


$course = $DB->get_record('course', array('id' => $courseid), '*', MUST_EXIST);
$context = context_course::instance($courseid);

$ltitype = $DB->get_record('lti_types', ['id' => $ltitypeid]);

require_login($course);

require_capability('mod/lti:view', $context);


$lti = new stdClass();

$lti->id = $resourcelinkid;
$lti->typeid = $ltitypeid;
$lti->launchcontainer = LTI_LAUNCH_CONTAINER_WINDOW;
$lti->toolurl = $contenturl;
$lti->custom = new stdClass();
$lti->instructorcustomparameters = [];
$lti->debuglaunch = false;
if ($customdata) {
    $decoded = json_decode($customdata, true);
    foreach ($decoded as $key => $value) {
        $lti->custom->$key = $value;
    }
}

lti_launch_tool($lti, 'richtexteditor');

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
 * This file contains library functions for the Atto LTI plugin
 *
 * @package atto_lti
 * @copyright  2018 The Regents of the University of California
 * @author     David Shepard
 * @license    Not figured out
 */


defined('MOODLE_INTERNAL') || die();

global $CFG; // should be defined in config.php

require_once($CFG->dirroot.'/mod/lti/locallib.php');

// require_once  './mod/lti/locallib.php';

function atto_lti_strings_for_js () {
    global $PAGE;
    $PAGE->requires->strings_for_js(['lti', 'erroroccurred'], 'atto_lti');
}


function atto_lti_params_for_js ($elementid, $options, $fpoptions) {
    global $PAGE;

    $ltitooltypes = lti_load_type_by_placement('richtexteditorplugin');

    $tooltypes = [];
    foreach ($ltitooltypes as $type) {
        $type->config = lti_get_config(
            (object)[
                'typeid' => $type->id,
            ]
        );
        $tooltypes[] = $type;
    }

    return [
        'toolTypes' => $tooltypes,
        'course' => $PAGE->course,
        'resourcebase' => sha1(
            $PAGE->url->__toString() . '&' . $PAGE->course->sortorder
                . '&' . $PAGE->course->timecreated
        ),
    ];
}

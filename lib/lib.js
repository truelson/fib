/* ===========================================================================
	
	File: lib.js

	Author - John Dunning, edits by palmer
	Copyright - 2009 John Dunning.  All rights reserved.
	Email - fw@johndunning.com
	Website - http://johndunning.com/fireworks

	Release - 1.1.0 ($Revision: 1.2 $)
	Last update - $Date: 2010/05/09 00:07:06 $

   ======================================================================== */


// ===========================================================================
//  Main
// ===========================================================================

try {

(function() 
{
	var dojoPath = "dojo/dojo.js";
	var sharedPath = fw.appJsCommandsDir + "/lib/" + dojoPath;
	var localPath = fw.currentScriptDir + "/" + dojoPath;

		// look in the local path first, since the user may have an old version
		// installed that used the shared /lib path to store the dojo files and
		// we want to use the local ones instead 
	if (Files.exists(localPath)) {
		fw.runScript(localPath);
	} else if (Files.exists(sharedPath)) {
		fw.runScript(sharedPath);
	} else {
		alert("This command requires the dojo toolkit to be installed.");
	}

  dojo.require( 'underscore' )
  dojo.require( 'fib_helper' )
  dojo.require( 'fib_extractor' )
  dojo.require( 'fib_exporter' )
  dojo.require( 'dojo._base.json' )

})();

} catch (exception) {
	alert([exception, exception.lineNumber, exception.fileName].join("\n"));
}

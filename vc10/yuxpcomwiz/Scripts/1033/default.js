function OnFinish(selProj, selObj)
{
	try
	{
	    /// 增加符号 
        //////////////////////////////////////////////////////////////////////////
		var strSolutionName = "";
		var strProjectPath = "";
		
		var strProjectName = wizard.FindSymbol('PROJECT_NAME');
		var strProjectPath = wizard.FindSymbol('PROJECT_PATH');
		var oldProjFolder = strProjectPath;		
		
		selProj = CreateCustomProject(strProjectName, strProjectPath);
		strProjectPath = wizard.FindSymbol('PROJECT_PATH');
		
/*
		var strSolutionPath = "";
		
		strSolutionName = wizard.FindSymbol("VS_SOLUTION_NAME");
		if (strSolutionName.length)
		{
			strSolutionPath = strProjectPath.substr(0, strProjectPath.length - strProjectName.length);
			strProjectPath = strSolutionPath + "src\\" + strProjectName;
		}
		
		wizard.AddSymbol( "YU_DIR_BIN", strSolutionPath + "bin\\" );	
		wizard.AddSymbol( "YU_DIR_DOC", strSolutionPath + "doc\\" );
		wizard.AddSymbol( "YU_DIR_SRC_INC", strSolutionPath + "src\\include\\" );
		wizard.AddSymbol( "YU_DIR_SRC_INT", strSolutionPath + "src\\interface\\" );
		*/

		///////////////
		//selProj = CreateProject(strProjectName, strProjectPath);
		selProj.Object.Keyword = "xpcomWizProj";
		
		
		AddConfig(selProj, strProjectName);
		
		AddFilters(selProj);
		
		AddGUID();

		var InfFile = CreateCustomInfFile();
		AddFilesToCustomProj(selProj, strProjectName, strProjectPath, InfFile);
		InfFile.Delete();


		
		
		//fso = new ActiveXObject('Scripting.FileSystemObject');
		//wizard.YesNoAlert(oldProjFolder);
		//fso.DeleteFolder(oldProjFolder);
		
						//var PreBuildTool = config.Tools("VCPreBuildEventTool");
				//PreBuildTool.Description = "Buils idl file . . .";
				//if ( wizard.FindSymbol('YU_USE_INTERFACE'))
				//{
				//	gentypedef.bat
				//	var name = wizard.FindSymbol('PROJECT_NAME');
					//PreBuildTool.CommandLine = "AutoBuildNumber.exe \"$(ProjectDir)/" + name + ".rc\""
				//	PreBuildTool.CommandLine = "$(ProjectDir)/interface/gentypedef.bat"
				//}

		
		
		/*
		var CBTool =  oIdlFile.FileConfigurations("Debug").Tool;
        CBTool.CommandLine = "$(ProjectDir)" + strProjectName + ".bat $(InputFileName)";
        CBTool.Description = "正在创建头文件和xpt文件...";
        CBTool.Outputs = ".\\$(InputName).h";
		
		oIdlFile.FileConfigurations("Release").Tool = selProj.Object.Configurations("Release").Tools("VCCustomBuildTool");
        var CBTool =  oIdlFile.FileConfigurations("Release").Tool;
        CBTool.CommandLine = "$(ProjectDir)" + strProjectName + ".bat $(InputFileName)";
        CBTool.Description = "正在创建头文件和xpt文件...";
        CBTool.Outputs = ".\\$(InputName).h"; 
		*/
		
		//////////////////////
		selProj.Object.Save();		
	}
	catch(e)
	{
		if (e.description.length != 0)
			SetErrorInfo(e);
		return e.number
	}
}

function CreateCustomProject(strProjectName, strProjectPath)
{
	try
	{
		var strProjTemplatePath = wizard.FindSymbol('PROJECT_TEMPLATE_PATH');
		var strProjTemplate = '';
		strProjTemplate = strProjTemplatePath + '\\default.vcxproj';
		var strSolutionPath = strProjectPath.substr(0, strProjectPath.length - strProjectName.length);
		strProjectPath = strSolutionPath + "src\\" + strProjectName;
		wizard.AddSymbol('PROJECT_PATH',  strProjectPath );

		var Solution = dte.Solution;
		var strSolutionName = "";
		if (wizard.FindSymbol("CLOSE_SOLUTION"))
		{
			Solution.Close();
			strSolutionName = wizard.FindSymbol("VS_SOLUTION_NAME");
			if (strSolutionName.length)
			{
				Solution.Create(strSolutionPath, strSolutionName);		
			}
		}

		
		var strProjectNameWithExt = '';
		strProjectNameWithExt = strProjectName + '.vcxproj';

		var oTarget = wizard.FindSymbol("TARGET");
		var prj;
		if (wizard.FindSymbol("WIZARD_TYPE") == vsWizardAddSubProject)  // vsWizardAddSubProject
		{
			var prjItem = oTarget.AddFromTemplate(strProjTemplate, strProjectNameWithExt);
			prj = prjItem.SubProject;
		}
		else
		{
			prj = oTarget.AddFromTemplate(strProjTemplate, strProjectPath, strProjectNameWithExt);
		}
		var fxtarget = wizard.FindSymbol("TARGET_FRAMEWORK_VERSION");
		if (fxtarget != null && fxtarget != "")
		{
		    fxtarget = fxtarget.split('.', 2);
		    if (fxtarget.length == 2)
			prj.Object.TargetFrameworkVersion = parseInt(fxtarget[0]) * 0x10000 + parseInt(fxtarget[1])
		}
		
		//var ss = wizard.FindSymbol('PROJECT_PATH');
		//wizard.YesNoAlert(ss);	
		return prj;
	}
	catch(e)
	{
		throw e;
	}
}

function AddFilters(proj)
{
	try
	{
		// Add the folders to your project
		var strSrcFilter = wizard.FindSymbol('SOURCE_FILTER');
		var group = proj.Object.AddFilter('Source Files');
		group.Filter = strSrcFilter;

		strSrcFilter = wizard.FindSymbol('INCLUDE_FILTER');
		group = proj.Object.AddFilter('Header Files');
		group.Filter = strSrcFilter;

		strSrcFilter = wizard.FindSymbol('RESOURCE_FILTER');
		group = proj.Object.AddFilter('Resource Files');
		group.Filter = strSrcFilter;
		
		if( wizard.FindSymbol('YU_USE_INTERFACE') )
		{
			strSrcFilter = wizard.FindSymbol('INTERFACE_FILTER');
			group = proj.Object.AddFilter('Interface Files');
			group.Filter = strSrcFilter;
			
			strSrcFilter = wizard.FindSymbol('TOOLS_FILTER');
			group = proj.Object.AddFilter('Tools Files');
			group.Filter = strSrcFilter;			
		}
		
	}
	catch(e)
	{
		throw e;
	}
}
function AddConfig(proj, strProjectName)
{
	try
	{
		var useDLL = true;

		var nCntr;
		for(nCntr = 0; nCntr < 2; nCntr++)
		{
			// Check if it's Debug configuration
			var bDebug = false;
			if( nCntr == 0 )
				bDebug = true;

			// General settings
			var config;
			if(bDebug)
			{ 
				config = proj.Object.Configurations("Debug");
				config.ATLMinimizesCRunTimeLibraryUsage = false;
			}
			else
			{
				config = proj.Object.Configurations("Release");
				config.ATLMinimizesCRunTimeLibraryUsage = true;
			}
			
			config.IntermediateDirectory = "$(Configuration)\\";
			config.OutputDirectory = "../../bin/components/";
			config.CharacterSet = charSetUnicode;
			config.ConfigurationType  = typeDynamicLibrary;
			
			// Compiler settings
			var CLTool = config.Tools('VCCLCompilerTool');
			CLTool.RuntimeTypeInfo = true;
			//CLTool.TreatWChar_tAsBuiltInType = false;
			//CLTool.Detect64BitPortabilityProblems = true;
			CLTool.WarningLevel = warningLevel_3;
			CLTool.AdditionalIncludeDirectories = "..\\include;..\\interface;$(XPCOM_SDK)\\include"
			
			//var forcedIncludes = "stdafx.h;";
			//CLTool.ForcedIncludeFiles = forcedIncludes;

			CLTool.PrecompiledHeaderThrough = "stdafx.h";
			CLTool.PrecompiledHeaderFile = "$(IntDir)/$(TargetName).pch";
			CLTool.UsePrecompiledHeader = pchNone;
			//CLTool.UsePrecompiledHeader = pchCreateUsingSpecific;
			
			//CLTool.ExceptionHandling = true;
			
			if(bDebug)
			{
				CLTool.RuntimeLibrary = rtMultiThreadedDebugDLL;
				CLTool.MinimalRebuild = true;
				CLTool.DebugInformationFormat = debugEditAndContinue;
				CLTool.BasicRuntimeChecks = runtimeBasicCheckAll;
				CLTool.Optimization = optimizeDisabled;
			}
			else
			{
				CLTool.RuntimeLibrary = rtMultiThreadedDLL;
				CLTool.DebugInformationFormat = debugDisabled;
			}

			var strDefines = GetPlatformDefine(config);
			strDefines += "XPCOM_GLUE;XP_WIN;XP_WIN32;XPCOM_GLUE_USE_NSPR";
			if(bDebug)
			{
				strDefines += "_DEBUG;";
			}
			else
			{
				strDefines += "NDEBUG;";
			}
				
			strDefines += "_WINDOWS;";
			
			strDefines += "_CRT_SECURE_NO_DEPRECATE;"
			
			CLTool.PreprocessorDefinitions = strDefines;
	
			// Linker settings
			var LinkTool = config.Tools('VCLinkerTool');

			LinkTool.SubSystem = subSystemWindows;
			LinkTool.TargetMachine = machineX86;
			
			var additionalDepends = "";
			if(bDebug)
			{
				LinkTool.LinkIncremental = linkIncrementalYes;
				LinkTool.GenerateDebugInformation = true;
			}
			else
			{
				LinkTool.LinkIncremental = linkIncrementalNo;
			}
			additionalDepends += "nspr4.lib xpcom.lib xpcomglue_s_nomozalloc.lib";
			
			LinkTool.AdditionalDependencies = additionalDepends;
			LinkTool.AdditionalLibraryDirectories = "$(XPCOM_SDK)\\lib";
		
			// As of VC8, manifests are used with executables to inform the operating system of its DLL dependencies
			// This covers ATL, MFC, Standard C++, and CRT libraries, see the MSDN topic "Visual C++ Libraries as Shared Side-by-Side Assemblies" for details
			// But, this manifest is unnecessary for statically linked programs
			if(!useDLL)
			{
				LinkTool.GenerateManifest = false;
				
				var ManifestTool = config.Tools('VCManifestTool');
				ManifestTool.EmbedManifest = false;			
			}
			
			// Resource settings
			var RCTool = config.Tools("VCResourceCompilerTool");
			RCTool.Culture = rcEnglishUS;
			RCTool.AdditionalIncludeDirectories = "$(IntDir)";
			if(bDebug)
				RCTool.PreprocessorDefinitions = "_DEBUG";
			else
				RCTool.PreprocessorDefinitions = "NDEBUG";
			
			// 添加预编译事件
			if(!bDebug)
			{
				//var PreBuildTool = config.Tools("VCPreBuildEventTool");
				//PreBuildTool.Description = "Buils idl file . . .";
				//if ( wizard.FindSymbol('YU_USE_INTERFACE'))
				//{
				//	gentypedef.bat
				//	var name = wizard.FindSymbol('PROJECT_NAME');
					//PreBuildTool.CommandLine = "AutoBuildNumber.exe \"$(ProjectDir)/" + name + ".rc\""
				//	PreBuildTool.CommandLine = "$(ProjectDir)/interface/gentypedef.bat"
				//}
			}

			var PreBuildTool = config.Tools("VCPreBuildEventTool");
			PreBuildTool.Description = "Buils idl file . . .";
			PreBuildTool.CommandLine = "$(SolutionDir)\\src\\interface\\gentypedef.bat"
		}
	}
	catch(e)
	{
		throw e;
	}
}

function DelFile(fso, strWizTempFile)
{
	try
	{
		if (fso.FileExists(strWizTempFile))
		{
			var tmpFile = fso.GetFile(strWizTempFile);
			tmpFile.Delete();
		}
	}
	catch(e)
	{
		throw e;
	}
}

function CreateCustomInfFile()
{
	try
	{
		var fso, TemplatesFolder, TemplateFiles, strTemplate;
		fso = new ActiveXObject('Scripting.FileSystemObject');

		var TemporaryFolder = 2;
		var tfolder = fso.GetSpecialFolder(TemporaryFolder);
		var strTempFolder = tfolder.Drive + '\\' + tfolder.Name;

		var strWizTempFile = strTempFolder + "\\" + fso.GetTempName();

		var strTemplatePath = wizard.FindSymbol('TEMPLATES_PATH');
		var strInfFile = strTemplatePath + '\\Templates.inf';
		wizard.RenderTemplate(strInfFile, strWizTempFile);

		var WizTempFile = fso.GetFile(strWizTempFile);
		return WizTempFile;
	}
	catch(e)
	{
		throw e;
	}
}

function GetTargetName(strName, strProjectName)
{
	try
	{
		var strTarget = strName;
		var strResPath = "res\\";
		var nNameLen = strName.length;
		if( strName == "yuxpcom_I.idl" ) {
			var strInterfaceName = wizard.FindSymbol('YU_INTERFACE_NAME');
			strTarget = "..\\interface\\" + strInterfaceName + ".idl";
		}
		else if( strName == "gentypedef.bat" ) {
			strTarget = "..\\interface\\" + strName;
		}
		else if( strName == "bin_comp_yuaccess.manifest" ) {
			strTarget = "..\\..\\bin\\components\\" + strName.substr(9, nNameLen-9);
		}
		else if(strName == "bin_application.ini") {
			strTarget = "..\\..\\bin\\" + strName.substr(4, nNameLen-4);
		}
		else if(strName == "bin_chrome.manifest") {
			strTarget = "..\\..\\bin\\" + strName.substr(4, nNameLen-4);
		}
		else if(strName == "bin_build.xml") {
			strTarget = "..\\..\\bin\\" + strName.substr(4, nNameLen-4);
		}		
		else if(strName == "bin_install.rdf") {
			strTarget = "..\\..\\bin\\" + strName.substr(4, nNameLen-4);
		}		
		else if(strName == "bin_run.bat") {
			strTarget = "..\\..\\bin\\" + strName.substr(4, nNameLen-4);
		}
		else if(strName == "bin_def_pre_prefs.js") {
			strTarget = "..\\..\\bin\\defaults\\preferences\\" + strName.substr(12, nNameLen-12);
		}
		else if(strName == "chr_con_about.js") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_about.xul") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_controller.js") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_head.js") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_options.xul") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_opt_network.xul") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_test.js") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_con_test.xul") {
			strTarget = "..\\..\\bin\\chrome\\content\\" + strName.substr(8, nNameLen-8);
		}
		else if(strName == "chr_loc_en_about.dtd") {
			strTarget = "..\\..\\bin\\chrome\\locale\\en-US\\" + strName.substr(11, nNameLen-11);
		}
		else if(strName == "chr_loc_en_options.dtd") {
			strTarget = "..\\..\\bin\\chrome\\locale\\en-US\\" + strName.substr(11, nNameLen-11);
		}
		else if(strName == "chr_loc_en_opt_network.dtd") {
			strTarget = "..\\..\\bin\\chrome\\locale\\en-US\\" + strName.substr(11, nNameLen-11);
		}
		else if(strName == "chr_loc_en_test.dtd") {
			strTarget = "..\\..\\bin\\chrome\\locale\\en-US\\" + strName.substr(11, nNameLen-11);
		}
		else if(strName == "chr_skin_about.css") {
			strTarget = "..\\..\\bin\\chrome\\skin\\" + strName.substr(9, nNameLen-9);
		}
		else if(strName == "chr_skin_options.css") {
			strTarget = "..\\..\\bin\\chrome\\skin\\" + strName.substr(9, nNameLen-9);
		}
		else if(strName == "chr_skin_test.css") {
			strTarget = "..\\..\\bin\\chrome\\skin\\" + strName.substr(9, nNameLen-9);
		}			
		else if(strName == "chr_skin_close.png") {
			strTarget = "..\\..\\bin\\chrome\\skin\\images\\" + strName.substr(9, nNameLen-9);
		}
		else if(strName == "chr_skin_copy.png") {
			strTarget = "..\\..\\bin\\chrome\\skin\\images\\" + strName.substr(9, nNameLen-9);
		}		
		else if(strName == "chr_skin_options-big.png") {
			strTarget = "..\\..\\bin\\chrome\\skin\\images\\" + strName.substr(9, nNameLen-9);
		}
		else if(strName == "chr_skin_options-network.png") {
			strTarget = "..\\..\\bin\\chrome\\skin\\images\\" + strName.substr(9, nNameLen-9);
		}
		else if( strName == "inc_doc.txt" )
		{
			strTarget = "..\\include\\" + strName.substr(4, nNameLen-4);
		}
		else if(strName.substr(0, 7) == "yuxpcom" )
		{
			var nNameLen = strName.length;
			var strSafeProjectName = wizard.FindSymbol('YU_COMP_NAME');
			strTarget = strSafeProjectName + strName.substr(7, nNameLen - 7);
		}

		return strTarget; 
	}
	catch(e)
	{
		throw e;
	}
}

function AddFilesToCustomProj(proj, strProjectName, strProjectPath, InfFile)
{
	try
	{	
		var projItems = proj.ProjectItems

		var strTemplatePath = wizard.FindSymbol('TEMPLATES_PATH');
		var strSafeProjectName = wizard.FindSymbol('SAFE_PROJECT_NAME');

		var strTpl = '';
		var strName = '';
		
		var strTextStream = InfFile.OpenAsTextStream(1, -2);
		while (!strTextStream.AtEndOfStream)
		{
			strTpl = strTextStream.ReadLine();
			if (strTpl != '')
			{
				strName = strTpl;
				var strTarget = GetTargetName(strName, strProjectName);
				var strTemplate = strTemplatePath + '\\' + strTpl;
				var strFile = strProjectPath + '\\' + strTarget;

				var bCopyOnly = false;  //"true" will only copy the file from strTemplate to strTarget without rendering/adding to the project
				var strExt = strName.substr(strName.lastIndexOf("."));
				if(strExt==".bmp" || strExt==".ico" || strExt==".gif" || strExt==".rtf" || strExt==".css" || strExt== ".exe"
					|| strExt== ".png")
					bCopyOnly = true;
					
				wizard.RenderTemplate(strTemplate, strFile, bCopyOnly);
				if ( bCopyOnly )
					continue;
				
				//wizard.YesNoAlert(strTarget);
				// Add Files to Project
				proj.Object.AddFile(strFile);
			}
		}
		strTextStream.Close();
	}
	catch(e)
	{
		throw e;
	}
}

function AddGUID()
{
	if(wizard.FindSymbol('YU_USE_INTERFACE'))
	{	
		var interID = wizard.CreateGuid();
		strVal = wizard.FormatGuid(interID, 0);
		wizard.AddSymbol( "YU_INTERFACE_ID_IDL", strVal );	
		strVal = wizard.FormatGuid(interID, 2);		
		wizard.AddSymbol( "YU_INTERFACE_ID_CLASS", strVal );	
	}
	
	var compName = wizard.FindSymbol('YU_COMP_NAME');
	if( compName ) {
		wizard.AddSymbol( "YU_COMP_NAME_UPCASE", compName.toUpperCase() );	
	}
	
	var interName = wizard.FindSymbol('YU_INTERFACE_NAME');
	if( interName ) {
		
		wizard.AddSymbol( "YU_INTERFACE_NAME_UPCASE", interName.toUpperCase() );
	}

	if(wizard.FindSymbol('GRS_USE_TOOLBAR'))
	{
		wizard.AddSymbol( "GRS_GUID_TOOLBAR", wizard.CreateGuid() );
	}
	
	////
	var date1;
  var dateString;
  date1 = new Date();
  dateString = date1.getFullYear().toString();
  var month = date1.getMonth() + 1;
  if( month < 10 )
  	dateString += "0";
  dateString += month;
  
  var day = date1.getDate();
  if( day < 10 )
  	dateString += "0";  	
  dateString += day;
 
  wizard.AddSymbol( "YU_CREATE_DATE", dateString );
}

